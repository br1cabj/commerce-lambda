const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ApiOptions extends RequestInit {
  tenantSlug?: string;
}

let isRedirecting = false;

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { tenantSlug, headers: customHeaders, body, ...restOptions } = options;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
    ...(token ? { "auth-token": token } : {}),
  };

  if (customHeaders) {
    Object.assign(headers, customHeaders as Record<string, string>);
  }

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers,
      body,
      signal: controller.signal,
    });
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error("Network error. Please check your connection.");
  }
  clearTimeout(timeoutId);

  let data: unknown = {};
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text().catch(() => "");
    if (text) {
      data = { message: text.slice(0, 500) };
    }
  }

  if (!response.ok) {
    const errorData = data as { message?: string; details?: string };
    const errorMsg =
      errorData.details ||
      errorData.message ||
      `Request failed (${response.status})`;

    if (response.status === 401 || errorMsg === "User not found or deleted") {
      if (typeof window !== "undefined" && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage");
        const currentPath = window.location.pathname;
        const redirectParam =
          currentPath !== "/login" && currentPath !== "/register"
            ? `?redirect=${encodeURIComponent(currentPath)}`
            : "";
        window.location.href = `/login${redirectParam}`;
      }
    }

    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: (endpoint: string, tenantSlug?: string) =>
    apiRequest(endpoint, { method: "GET", tenantSlug }),

  post: (endpoint: string, body: unknown, tenantSlug?: string) =>
    apiRequest(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      tenantSlug,
    }),

  put: (endpoint: string, body: unknown, tenantSlug?: string) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      tenantSlug,
    }),

  delete: (endpoint: string, tenantSlug?: string) =>
    apiRequest(endpoint, { method: "DELETE", tenantSlug }),
};

export default api;
