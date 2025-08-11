// src/lib/user-management-utils.ts
import { Shield, GraduationCap, User } from "lucide-react";

export function getRoleIcon(role: string) {
  switch (role) {
    case "ADMIN":
      return Shield;
    case "PROFESSOR":
      return GraduationCap;
    case "STUDENT":
      return User;
    default:
      return User;
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800";
    case "PROFESSOR":
      return "bg-blue-100 text-blue-800";
    case "STUDENT":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "مدير";
    case "PROFESSOR":
      return "مدرس";
    case "STUDENT":
      return "ملتحق";
    default:
      return role;
  }
}