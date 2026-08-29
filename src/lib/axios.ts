import axios from "axios";

const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000/api/v1";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Shape of a failed response. The API's exception filter reports the detail on
 * `error` (see http-exception.filter.ts), and class-validator sends an array
 * with one entry per failed rule. `message` is kept as a fallback for any
 * response that bypasses the filter, such as a proxy or gateway error.
 */
interface NestErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string | string[];
}

/**
 * The backend's global ResponseInterceptor wraps every success payload as
 * `{ success: true, data: T }`, except paginated list results which are
 * spread alongside `success` as `{ success, data: T[], total, page, limit,
 * totalPages }` (see response.interceptor.ts). Unwrap both shapes here so
 * callers can work with the plain payload / PaginatedResult<T>.
 */
interface ApiEnvelope<T> {
  success: true;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return (
    !!body &&
    typeof body === "object" &&
    (body as { success?: unknown }).success === true
  );
}

function unwrapEnvelope<T>(body: unknown): T {
  if (!isEnvelope(body)) return body as T;
  const isPaginated = "total" in body && "totalPages" in body;
  return (isPaginated ? body : body.data) as T;
}

/**
 * A request made with `responseType: "blob"` — the PDF download — receives its
 * error body as a Blob rather than parsed JSON, so the detail has to be read
 * out of it before the message can be found.
 */
async function readErrorBody(data: unknown): Promise<NestErrorBody | undefined> {
  if (!data) return undefined;

  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()) as NestErrorBody;
    } catch {
      // A non-JSON blob carries nothing useful to show.
      return undefined;
    }
  }

  return data as NestErrorBody;
}

function joinDetail(detail: string | string[] | undefined): string | undefined {
  if (!detail) return undefined;
  if (Array.isArray(detail)) {
    const parts = detail.filter(Boolean);
    return parts.length ? parts.join(", ") : undefined;
  }
  return detail || undefined;
}

function toMessage(body: NestErrorBody | undefined, fallback: string): string {
  return joinDetail(body?.error) ?? joinDetail(body?.message) ?? fallback;
}

// The backend issues an httpOnly session cookie — there is no client-readable
// access/refresh token to attach as an Authorization header, so auth is
// carried entirely by `withCredentials` rather than a request interceptor.
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, undefined, {
        withCredentials: true,
      })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => {
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return api(originalRequest);
      }
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      return Promise.reject(new ApiError(401, "Session expired"));
    }

    const body = await readErrorBody(error.response?.data);
    return Promise.reject(
      new ApiError(
        error.response?.status ?? 0,
        toMessage(body, error.message || "Something went wrong"),
        body,
      ),
    );
  },
);

export { API_BASE_URL };
