// src/components/admin/user-management/UserStatsCards.tsx
import { Users, User, GraduationCap, Calendar } from "lucide-react";
import { StatsCards } from "@/components/shared/StatsCards";
import type { UserStats } from "@/hooks/useUserManagement";

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  const statsData = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active`,
      icon: Users,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    },
    {
      id: 'students',
      title: 'Students',
      value: stats.totalStudents,
      subtitle: `${((stats.totalStudents / stats.totalUsers) * 100).toFixed(1)}% of total`,
      icon: User,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    },
    {
      id: 'professors',
      title: 'Professors',
      value: stats.totalProfessors,
      subtitle: `${((stats.totalProfessors / stats.totalUsers) * 100).toFixed(1)}% of total`,
      icon: GraduationCap,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    },
    {
      id: 'new-users',
      title: 'New Users',
      value: stats.newUsersThisMonth,
      subtitle: 'This month',
      icon: Calendar,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    }
  ];

  return <StatsCards stats={statsData} />;
}