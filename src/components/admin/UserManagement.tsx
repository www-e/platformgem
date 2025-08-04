// src/components/admin/UserManagement.tsx
"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserStatsCards } from "./user-management/UserStatsCards";
import { UserFilters } from "./user-management/UserFilters";
import { UsersList } from "./user-management/UsersList";
import { LoadingState } from "./user-management/LoadingState";

export function UserManagement() {
  const {
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    filteredUsers,
    handleUserAction
  } = useUserManagement();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-muted-foreground">
            إدارة حسابات المستخدمين والصلاحيات
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && <UserStatsCards stats={stats} />}

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Users List */}
      <UsersList
        users={filteredUsers}
        onUserAction={handleUserAction}
      />
    </div>
  );
}
