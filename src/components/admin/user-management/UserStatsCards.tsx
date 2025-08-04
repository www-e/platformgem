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
      icon: Users
    },
    {
      id: 'students',
      title: 'الطلاب',
      value: stats.totalStudents,
      subtitle: `${((stats.totalStudents / stats.totalUsers) * 100).toFixed(1)}% من المجموع`,
      icon: User
    },
    {
      id: 'professors',
      title: 'المدرسين',
      value: stats.totalProfessors,
      subtitle: `${((stats.totalProfessors / stats.totalUsers) * 100).toFixed(1)}% من المجموع`,
      icon: GraduationCap
    },
    {
      id: 'new-users',
      title: 'مستخدمين جدد',
      value: stats.newUsersThisMonth,
      subtitle: 'هذا الشهر',
      icon: Calendar
    }
  ];

  return <StatsCards stats={statsData} />;
}