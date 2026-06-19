const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ApiOptions extends RequestInit {
  tenantSlug?: string;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { tenantSlug, headers: customHeaders, body, ...restOptions } = options;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
    body,
  });

  let data: unknown = {};
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorData = data as { message?: string; details?: string };
    throw new Error(errorData.details || errorData.message || "An unexpected error occurred");
  }

  return data;
}

export const api = {
  get: (endpoint: string, tenantSlug?: string) =>
    apiRequest(endpoint, { method: "GET", tenantSlug }),

  post: (endpoint: string, body: unknown, tenantSlug?: string) =>
    apiRequest(endpoint, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), tenantSlug }),

  put: (endpoint: string, body: unknown, tenantSlug?: string) =>
    apiRequest(endpoint, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body), tenantSlug }),

  delete: (endpoint: string, tenantSlug?: string) =>
    apiRequest(endpoint, { method: "DELETE", tenantSlug }),
};

export default api;
