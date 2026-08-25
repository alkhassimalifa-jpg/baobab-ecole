import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/connexion"];
const isPublicSchoolLogin = (pathname: string) => /^\/ecole\/[^/]+\/connexion$/.test(pathname);

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isPublicSchoolLogin(pathname);
  const isLoggedIn = !!req.auth;

  if (isPublicRoute) {
    if (isLoggedIn && pathname === "/connexion") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/connexion", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};