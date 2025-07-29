// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getRoleBasedRedirectUrl, isCorrectDashboardForRole } from "@/lib/auth-redirects";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, API routes, and root
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/') ||
    pathname.includes('/favicon.ico') ||
    pathname === '/' ||
    pathname.startsWith('/debug-auth') // Allow debug page
  ) {
    return NextResponse.next();
  }

  console.log('🛡️ Middleware processing:', pathname);
  
  // Get the user token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isLoggedIn = !!token && token.isActive;
  const userRole = token?.role as UserRole;

  // Define route types
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminRoute = pathname.startsWith('/admin');
  const isProfessorRoute = pathname.startsWith('/professor');
  const isStudentRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  
  // Public routes that don't require authentication
  const isPublicRoute = pathname.startsWith('/courses') || 
                       pathname.startsWith('/certificates/verify') ||
                       pathname === '/';
  
  // Logic 1: Handle users trying to access auth pages (login/signup)
  if (isAuthRoute) {
    console.log('🔐 Auth route accessed:', { pathname, isLoggedIn, userRole });
    if (isLoggedIn) {
      // Redirect authenticated users to their appropriate dashboard
      const dashboardUrl = getRoleBasedRedirectUrl(userRole);
      console.log('↩️ Redirecting authenticated user from auth page:', dashboardUrl);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    // Allow unauthenticated users to access auth pages
    console.log('✅ Allowing unauthenticated user to access auth page');
    return NextResponse.next();
  }

  // Logic 2: Handle public routes (accessible to everyone)
  if (isPublicRoute) {
    console.log('🌐 Public route accessed:', pathname);
    return NextResponse.next();
  }

  // Logic 3: Handle unauthenticated users trying to access protected routes
  if (!isLoggedIn) {
    // Redirect to login with callback URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    console.log('🚫 Redirecting unauthenticated user to login:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Logic 4: Handle role-based access control for authenticated users
  if (isLoggedIn && userRole) {
    // Admin access control
    if (isAdminRoute && userRole !== 'ADMIN') {
      const dashboardUrl = getRoleBasedRedirectUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Professor access control
    if (isProfessorRoute && userRole !== 'PROFESSOR') {
      const dashboardUrl = getRoleBasedRedirectUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Student access control - prevent access to admin/professor routes
    if (userRole === 'STUDENT' && (isAdminRoute || isProfessorRoute)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check if user is on the correct dashboard for their role
    const isDashboardRoute = isAdminRoute || isProfessorRoute || pathname.startsWith('/dashboard');
    if (isDashboardRoute && !isCorrectDashboardForRole(pathname, userRole)) {
      const correctUrl = getRoleBasedRedirectUrl(userRole);
      return NextResponse.redirect(new URL(correctUrl, request.url));
    }
  }

  // Allow access to the requested route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by Next.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - root path (/)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$).*)',
  ],
};