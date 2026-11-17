import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLogin = pathname.startsWith("/login");

  if (!session?.user) {
    if (isLogin) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = session.user.role;

  if (isLogin || pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = role === "OWNER" ? "/monitor" : "/today";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/today") && role !== "EMPLOYEE") {
    const url = req.nextUrl.clone();
    url.pathname = "/monitor";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/monitor") && role !== "OWNER") {
    const url = req.nextUrl.clone();
    url.pathname = "/today";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/today/:path*", "/monitor/:path*", "/calendar/:path*"],
};
