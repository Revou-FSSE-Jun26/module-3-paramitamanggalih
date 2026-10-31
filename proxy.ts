import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const role = request.cookies.get("revoshop_role")?.value;

  const isAdminRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  const isCustomerRoute =
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/checkout";

  if (!isAdminRoute && !isCustomerRoute) {
    return NextResponse.next();
  }

  if (role !== "admin" && role !== "customer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/checkout",
  ],
};
