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

interface NestErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
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

function toMessage(body: NestErrorBody | undefined, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join(", ") : body.message;
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

    const body = error.response?.data as NestErrorBody | undefined;
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
