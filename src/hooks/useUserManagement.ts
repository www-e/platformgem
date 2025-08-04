// src/hooks/useUserManagement.ts
"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROFESSOR" | "STUDENT";
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  enrollmentCount?: number;
  courseCount?: number;
}

interface UserStats {
  totalUsers: number;
  totalStudents: number;
  totalProfessors: number;
  totalAdmins: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/admin/user-stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: "activate" | "deactivate" | "delete"
  ) => {
    try {
      let response;

      if (action === "delete") {
        if (
          !confirm(
            "هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه."
          )
        ) {
          return;
        }
        response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
      } else {
        response = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: action === "activate",
          }),
        });
      }

      const result = await response.json();

      if (response.ok) {
        fetchUsers(); // Refresh the list
        const actionText =
          action === "delete"
            ? "حذف"
            : action === "activate"
            ? "تفعيل"
            : "إلغاء تفعيل";
        alert(`تم ${actionText} المستخدم بنجاح`);
      } else {
        alert(result.error?.message || "حدث خطأ في العملية");
      }
    } catch (error) {
      console.error("Failed to perform user action:", error);
      alert("حدث خطأ في العملية");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return {
    users,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    filteredUsers,
    handleUserAction,
    fetchUsers
  };
}

export type { UserData, UserStats };