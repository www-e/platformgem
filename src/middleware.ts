// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No need to protect these assets or the landing page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isLoggedIn = !!token;
  const isAdmin = token?.isAdmin === true;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Logic 1: Handle users trying to access auth pages (login/signup)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // If they are logged in, send them to their correct dashboard
      const url = isAdmin ? '/admin' : '/profile';
      return NextResponse.redirect(new URL(url, request.url));
    }
    // If not logged in, allow them to see the auth page
    return NextResponse.next();
  }

  // Logic 2: Handle unauthenticated users trying to access protected routes
  if (!isLoggedIn) {
    // Redirect them to login, but keep the intended destination for after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logic 3: Handle authenticated users
  // If a logged-in student tries to access an admin route, redirect them
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Otherwise, the user is authenticated and accessing a valid page, so allow it
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except the root and API routes
    "/((?!api|$).*)",
  ],
};