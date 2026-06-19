import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const hostParts = hostname.split(".");

  let tenantSlug: string | null = null;

  if (hostParts.length > 2) {
    tenantSlug = hostParts[0].toLowerCase();
  } else {
    tenantSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT || null;
  }

  const response = NextResponse.next();

  if (tenantSlug) {
    response.headers.set("x-tenant-slug", tenantSlug);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
