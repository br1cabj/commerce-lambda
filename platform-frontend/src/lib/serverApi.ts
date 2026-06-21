const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

export function getApiUrl(): string {
  return API_BASE_URL;
}
