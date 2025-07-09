// src/middleware.ts

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// auth is our configured Next-Auth object from lib/auth.ts
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup');
  const isLandingPage = nextUrl.pathname === '/';
  const isProtectedRoute = !isAuthRoute && !isLandingPage && !isApiRoute;

  // Rule 1: If trying to access auth routes while logged in, redirect to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Rule 2: If trying to access a protected route without being logged in, redirect to login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  // If none of the above rules match, allow the request to proceed
  return NextResponse.next();
});

// This config specifies which routes the middleware should run on.
// It's a performance optimization to avoid running it on static files.
export const config = {
  matcher: [
    // Match all routes except for static files and image optimization files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}