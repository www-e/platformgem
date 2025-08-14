// src/lib/api/auth.ts
// API authentication utilities (different from Next.js middleware)

import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { createErrorResponse, ApiErrors } from "@/lib/api-response";

/**
 * Authentication result for API routes
 */
export interface ApiAuthResult {
  user: {
    id: string;
    role: UserRole;
    name: string;
    email?: string;
    phone: string;
  };
}

/**
 * Authenticate user for API routes and check role permissions
 */
export async function authenticateApiUser(
  allowedRoles?: UserRole[]
): Promise<ApiAuthResult | ReturnType<typeof createErrorResponse>> {
  const session = await auth();

  if (!session?.user) {
    return ApiErrors.UNAUTHORIZED.create();
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
    return createErrorResponse(
      ApiErrors.FORBIDDEN.code,
      "غير مصرح لك بالوصول لهذه الخدمة",
      ApiErrors.FORBIDDEN.status
    );
  }

  return {
    user: {
      id: session.user.id,
      role: session.user.role as UserRole,
      name: session.user.name || "",
      email: session.user.email || undefined,
      phone: session.user.phone || "",
    },
  };
}

/**
 * Admin-only API authentication
 */
export async function authenticateAdmin(): Promise<
  ApiAuthResult | ReturnType<typeof createErrorResponse>
> {
  return authenticateApiUser(["ADMIN"]);
}

/**
 * Student-only API authentication
 */
export async function authenticateStudent(): Promise<
  ApiAuthResult | ReturnType<typeof createErrorResponse>
> {
  return authenticateApiUser(["STUDENT"]);
}

/**
 * Professor-only API authentication
 */
export async function authenticateProfessor(): Promise<
  ApiAuthResult | ReturnType<typeof createErrorResponse>
> {
  return authenticateApiUser(["PROFESSOR"]);
}

/**
 * Student or Admin API authentication (for testing/admin access)
 */
export async function authenticateStudentOrAdmin(): Promise<
  ApiAuthResult | ReturnType<typeof createErrorResponse>
> {
  return authenticateApiUser(["STUDENT", "ADMIN"]);
}

/**
 * Check if result is an error response
 */
export function isAuthError(
  result: unknown
): result is ReturnType<typeof createErrorResponse> {
  return !!(result && typeof (result as any).json === "function");
}
