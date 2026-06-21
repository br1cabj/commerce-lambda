import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host");
  const hostParts = hostname ? hostname.split(".") : [];

  let tenantSlug: string | null = null;
  const isLocalhost = hostname?.includes("localhost") || hostname?.includes("127.0.0.1");

  // Check if it's a subdomain (e.g. store.midominio.com) vs custom domain (e.g. mitienda.com)
  if (hostParts.length > 2 && !isLocalhost) {
    tenantSlug = hostParts[0].toLowerCase();
  } else if (isLocalhost) {
    tenantSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT || null;
  }

  const response = NextResponse.next();

  if (tenantSlug) {
    response.headers.set("x-tenant-slug", tenantSlug);
  }
  
  // Always pass the raw hostname so the backend can check for Custom Domains
  if (hostname) {
    response.headers.set("x-tenant-domain", hostname.split(":")[0]);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
