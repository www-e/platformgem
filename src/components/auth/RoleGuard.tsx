// src/components/auth/RoleGuard.tsx
import { ReactNode } from 'react';
import { UserRole } from '@prisma/client';
import { useRoleGuard } from '@/hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * Component that conditionally renders children based on user role
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null,
  showLoading = false 
}: RoleGuardProps) {
  const { hasAccess, isLoading } = useRoleGuard(allowedRoles);

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for role-based page protection
 */
export function withRoleGuard(allowedRoles: UserRole[], fallbackComponent?: ReactNode) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function GuardedComponent(props: P) {
      return (
        <RoleGuard 
          allowedRoles={allowedRoles} 
          fallback={fallbackComponent}
          showLoading={true}
        >
          <Component {...props} />
        </RoleGuard>
      );
    };
  };
}

/**
 * Convenience components for specific roles
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ProfessorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['PROFESSOR']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['STUDENT']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ProfessorOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['PROFESSOR', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}