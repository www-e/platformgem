// src/lib/auth-utils.ts
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";

/**
 * Utility functions for role-based access control
 */

export function hasRole(session: Session | null, role: UserRole): boolean {
  return session?.user?.role === role;
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'ADMIN');
}

export function isProfessor(session: Session | null): boolean {
  return hasRole(session, 'PROFESSOR');
}

export function isStudent(session: Session | null): boolean {
  return hasRole(session, 'STUDENT');
}

export function canManageUsers(session: Session | null): boolean {
  return isAdmin(session);
}

export function canManageCategories(session: Session | null): boolean {
  return isAdmin(session);
}

export function canCreateCourses(session: Session | null): boolean {
  return isAdmin(session) || isProfessor(session);
}

export function canManageCourse(session: Session | null, courseOwnerId?: string): boolean {
  if (isAdmin(session)) return true;
  if (isProfessor(session) && courseOwnerId === session?.user?.id) return true;
  return false;
}

export function canViewAnalytics(session: Session | null, resourceOwnerId?: string): boolean {
  if (isAdmin(session)) return true;
  if (isProfessor(session) && resourceOwnerId === session?.user?.id) return true;
  return false;
}

export function canEnrollInCourses(session: Session | null): boolean {
  return isStudent(session) || isAdmin(session); // Admins can enroll for testing
}

export function getDashboardPath(role: UserRole): string {
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

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'مدير النظام';
    case 'PROFESSOR':
      return 'أستاذ';
    case 'STUDENT':
      return 'طالب';
    default:
      return 'مستخدم';
  }
}

/**
 * Higher-order function to protect API routes based on roles
 * Note: This is a template - you'll need to import the appropriate auth function
 */
export function withAuth(allowedRoles: UserRole[]) {
  return function (handler: Function) {
    return async function (req: any, res: any, ...args: any[]) {
      // TODO: Import and use the appropriate session getter
      // const session = await getServerSession(req, res, authOptions);
      
      // For now, this is a placeholder - implement based on your auth setup
      throw new Error('withAuth function needs to be implemented with proper session handling');
    };
  };
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  session: Session | null,
  resourceType: 'course' | 'category' | 'user' | 'payment',
  action: 'create' | 'read' | 'update' | 'delete',
  resourceOwnerId?: string
): boolean {
  if (!session) return false;

  const { role } = session.user;

  // Admin can do everything
  if (role === 'ADMIN') return true;

  switch (resourceType) {
    case 'course':
      if (action === 'create') return role === 'PROFESSOR';
      if (action === 'read') return true; // Everyone can read published courses
      if (action === 'update' || action === 'delete') {
        return role === 'PROFESSOR' && resourceOwnerId === session.user.id;
      }
      break;

    case 'category':
      if (action === 'read') return true; // Everyone can read categories
      return false; // Only admins can manage categories (handled above)

    case 'user':
      if (action === 'read' && resourceOwnerId === session.user.id) return true;
      if (action === 'update' && resourceOwnerId === session.user.id) return true;
      return false; // Only admins can manage other users

    case 'payment':
      if (action === 'create') return role === 'STUDENT';
      if (action === 'read' && resourceOwnerId === session.user.id) return true;
      return false;
  }

  return false;
}