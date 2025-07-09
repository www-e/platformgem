// src/middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup');
  const isLandingPage = nextUrl.pathname === '/';
  const isProtectedRoute = !isAuthRoute && !isLandingPage && !isApiRoute;

  // Rule 1: If trying to access auth routes while logged in, redirect to profile
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/profile', nextUrl));
  }

  // Rule 2: If trying to access a protected route without being logged in, redirect to login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
