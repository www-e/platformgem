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
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} نشط`,
      icon: Users,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    },
    {
      id: 'students',
      title: 'الملتحقين',
      value: stats.totalStudents,
      subtitle: `${((stats.totalStudents / stats.totalUsers) * 100).toFixed(1)}% من المجموع`,
      icon: User,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    },
    {
      id: 'professors',
      title: 'المدرسين',
      value: stats.totalProfessors,
      subtitle: `${((stats.totalProfessors / stats.totalUsers) * 100).toFixed(1)}% من المجموع`,
      icon: GraduationCap,
      cardClassName: "border border-gray-200 bg-white shadow-sm",
      titleColor: "text-gray-700",
      valueColor: "text-gray-900",
      subtitleColor: "text-gray-500",
      iconColor: "text-gray-500"
    },
    {
      id: 'new-users',
      title: 'مستخدمين جدد',
      value: stats.newUsersThisMonth,
      subtitle: 'هذا الشهر',
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