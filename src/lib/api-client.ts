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

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function toMessage(body: NestErrorBody | undefined, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join(", ") : body.message;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      // Only set Content-Type when there's a body — Fastify's JSON body
      // parser rejects a request that declares application/json but sends
      // no body (e.g. DELETE with no payload) with a 400.
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new ApiError(401, "Session expired");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? ((await res.json()) as NestErrorBody & T) : undefined;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      toMessage(body, `Request failed with status ${res.status}`),
      body,
    );
  }

  return unwrapEnvelope<T>(body);
}

function toQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, unknown>) =>
    request<T>(`${path}${toQueryString(params)}`, { method: "GET" }),

  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { API_BASE_URL };
