const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown> | unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data ?? {};
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function parseErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return { message: res.statusText || "Request failed" };
  }
}

function throwApiError(res: Response, data: unknown): never {
  const body = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const msg =
    (typeof body.message === "string" && body.message) ||
    `Request failed (${res.status})`;
  throw new ApiError(msg, res.status, body);
}

/** Check soft-failure payloads that still return HTTP 200 */
export function assertApiSuccess(data: unknown, fallbackFeature = "This feature"): void {
  if (!data || typeof data !== "object") return;
  const body = data as Record<string, unknown>;
  if (body.success === false) {
    throw new ApiError(
      typeof body.message === "string"
        ? body.message
        : `${fallbackFeature} is not working right now.`,
      503,
      body
    );
  }
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Cannot reach the Domestic Real Estate server. Check that the API is running and your internet connection is OK.",
      0,
      {
        success: false,
        code: "network_error",
        message:
          "Cannot reach the Domestic Real Estate server. Check that the API is running and your internet connection is OK.",
        reason: "the website cannot connect to the API server",
        fix: "Make sure Laravel is running (php artisan serve) and NEXT_PUBLIC_API_URL points to it.",
      }
    );
  }

  if (!res.ok) {
    throwApiError(res, await parseErrorBody(res));
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      ...options,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the Domestic Real Estate server. Check that the API is running.",
      0,
      {
        success: false,
        code: "network_error",
        message: "Cannot reach the Domestic Real Estate server. Check that the API is running.",
        reason: "the website cannot connect to the API server",
        fix: "Start the Laravel API and confirm NEXT_PUBLIC_API_URL.",
      }
    );
  }

  if (!res.ok) {
    throwApiError(res, await parseErrorBody(res));
  }

  const data = (await res.json()) as T;
  assertApiSuccess(data);
  return data;
}

export async function apiPut<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      ...options,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the Domestic Real Estate server.",
      0,
      {
        success: false,
        code: "network_error",
        message: "Cannot reach the Domestic Real Estate server.",
        reason: "the website cannot connect to the API server",
        fix: "Start the Laravel API and confirm NEXT_PUBLIC_API_URL.",
      }
    );
  }

  if (!res.ok) {
    throwApiError(res, await parseErrorBody(res));
  }

  const data = (await res.json()) as T;
  assertApiSuccess(data);
  return data;
}

export async function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the Domestic Real Estate server.",
      0,
      {
        success: false,
        code: "network_error",
        message: "Cannot reach the Domestic Real Estate server.",
        reason: "the website cannot connect to the API server",
        fix: "Start the Laravel API and confirm NEXT_PUBLIC_API_URL.",
      }
    );
  }

  if (!res.ok) {
    throwApiError(res, await parseErrorBody(res));
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  const data = JSON.parse(text) as T;
  assertApiSuccess(data);
  return data;
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export { API_BASE };
