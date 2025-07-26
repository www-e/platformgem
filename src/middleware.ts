// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

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
  
  const isLoggedIn = !!token && token.isActive;
  const userRole = token?.role as UserRole;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminRoute = pathname.startsWith('/admin');
  const isProfessorRoute = pathname.startsWith('/professor');
  const isStudentRoute = pathname.startsWith('/profile') || pathname.startsWith('/courses');
  
  // Logic 1: Handle users trying to access auth pages (login/signup)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect to appropriate dashboard based on role
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
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

  // Logic 3: Handle role-based access control
  if (isAdminRoute && userRole !== 'ADMIN') {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  if (isProfessorRoute && userRole !== 'PROFESSOR') {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Allow students to access their routes and public course pages
  if (isStudentRoute && userRole === 'STUDENT') {
    return NextResponse.next();
  }

  // Allow admins and professors to access student routes for testing/management
  if (isStudentRoute && (userRole === 'ADMIN' || userRole === 'PROFESSOR')) {
    return NextResponse.next();
  }

  // Otherwise, the user is authenticated and accessing a valid page
  return NextResponse.next();
}

// Helper function to get dashboard URL based on user role
function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PROFESSOR':
      return '/professor';
    case 'STUDENT':
      return '/profile';
    default:
      return '/profile';
  }
}

export const config = {
  matcher: [
    // Match all paths except the root and API routes
    "/((?!api|$).*)",
  ],
};