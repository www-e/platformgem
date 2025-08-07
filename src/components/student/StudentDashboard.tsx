// src/components/student/StudentDashboard.tsx - Gamified Student Dashboard
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FadeInScroll,
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/micro-interactions";
import { useOptimizedMotion } from "@/hooks/useAnimations";
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Star,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Flame,
  Trophy,
  Crown,
  Gem,
  Shield,
  Rocket,
  Brain,
  Sparkles,
  DollarSign,
  Medal,
  ChevronRight,
  Plus,
  ArrowUp,
  Activity,
  Eye,
  Play,
  CheckCircle,
  Users,
  Gift,
  Bell,
  Settings,
  RefreshCw,
} from "lucide-react";
import { EnrolledCourses } from "./EnrolledCourses";
import { PaymentHistory } from "./PaymentHistory";
import { RecommendedCourses } from "./RecommendedCourses";
import { StudentProgress } from "./StudentProgress";
import { StudentCertificates } from "./StudentCertificates";
import { cn } from "@/lib/utils";

// --- INTERFACES (Keep as is) ---
interface StudentStats {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalWatchTime: number; // in minutes
  averageProgress: number;
  certificatesEarned: number;
  totalSpent: number;
  currentStreak: number;
  longestStreak: number;
  recentActivity: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
  achievements: Achievement[];
  // Gamification data
  currentXP: number;
  nextLevelXP: number;
  level: number;
  rank: string;
  totalPoints: number;
  monthlyRank: number;
  studyGoals: StudyGoal[];
  quickActions: QuickAction[];
}

interface RecentActivity {
  id: string;
  type:
    | "lesson_complete"
    | "course_enroll"
    | "certificate_earned"
    | "quiz_passed"
    | "achievement_unlocked"
    | "level_up";
  courseName: string;
  lessonName?: string;
  timestamp: Date;
  progress?: number;
  xpGained?: number;
}

interface UpcomingDeadline {
  id: string;
  courseName: string;
  title: string;
  dueDate: Date;
  type: "assignment" | "quiz" | "project";
  priority: "high" | "medium" | "low";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  earnedAt: Date;
  category: "completion" | "streak" | "engagement" | "excellence";
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  category: "time" | "courses" | "skills" | "certificates";
  completed: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  type: "course" | "lesson" | "certificate" | "goal";
  priority: number;
}


export function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { shouldReduceMotion } = useOptimizedMotion();

  const fetchStudentStats = useCallback(async () => {
    try {
      // Ensure we don't fetch if already loading
      if(!isLoading) setIsLoading(true);

      const response = await fetch("/api/student/dashboard-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await response.json();

      if (stats && data.level > stats.level) {
        setShowLevelUpAnimation(true);
        setTimeout(() => setShowLevelUpAnimation(false), 3000);
      }

      if (stats && data.achievements.length > stats.achievements.length) {
        const newAchievements = data.achievements.filter(
          (achievement: Achievement) =>
            !stats.achievements.some(
              (existing) => existing.id === achievement.id
            )
        );
        setNewAchievements(newAchievements);
        setTimeout(() => setNewAchievements([]), 5000);
      }

      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch student stats:", error);
      setStats(null); // Set stats to null on error
    } finally {
      setIsLoading(false);
    }
  }, [stats, isLoading]); // Add isLoading to dependencies

  useEffect(() => {
    fetchStudentStats();
    const interval = setInterval(fetchStudentStats, 120000);
    return () => clearInterval(interval);
  }, []); // Remove fetchStudentStats from here to prevent re-triggering

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };
  
  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "text-neutral-600 bg-neutral-100 border-neutral-200";
      case "rare":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "epic":
        return "text-purple-600 bg-purple-100 border-purple-200";
      case "legendary":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      default:
        return "text-neutral-600 bg-neutral-100 border-neutral-200";
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-neutral-200 bg-neutral-50";
    }
  };

  const calculateXPProgress = () => {
    if (!stats) return 0;
    return ((stats.currentXP % 1000) / 1000) * 100;
  };

  // --- START OF THE FIX ---

  // 1. Loading State
  if (isLoading && !stats) {
    return (
      <LoadingState
        cardCount={8}
        gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      />
    );
  }

  // 2. Error State
  if (!isLoading && !stats) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
          خطأ في تحميل البيانات
        </h3>
        <p className="text-neutral-600 font-primary mb-4">
          لم نتمكن من تحميل بيانات لوحة التحكم
        </p>
        <Button onClick={fetchStudentStats}>
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }
  
  // 3. Render content only if stats is not null
  if (!stats) return null; // Or a more specific error component

  // --- END OF THE FIX ---
  
  return (
    <div className="space-y-8">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUpAnimation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                🎉 مستوى جديد!
              </h2>
              <p className="text-neutral-600 font-primary mb-4">
                وصلت إلى المستوى {stats.level}
              </p>
              <Button onClick={() => setShowLevelUpAnimation(false)}>
                متابعة التعلم
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-elevation-5 max-w-sm"
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <achievement.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold font-display">إنجاز جديد!</h4>
                <p className="text-sm opacity-90 font-primary">
                  {achievement.title}
                </p>
                <p className="text-xs opacity-75 font-primary">
                  +{achievement.xpReward} XP
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enhanced Header */}
      <FadeInScroll>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-neutral-900 font-display">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              لوحة تحكم الطالب
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-neutral-600 font-primary">
                تتبع تقدمك وحقق أهدافك التعليمية
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Activity className="w-4 h-4" />
                <span className="font-primary">
                  آخر تحديث: {lastUpdate.toLocaleTimeString("ar-EG")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Level Badge */}
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-white font-display">
                    {stats.level}
                  </span>
                </div>
                <motion.div
                  className="absolute inset-0 border-4 border-primary-300 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, #10b981 ${calculateXPProgress()}%, transparent ${calculateXPProgress()}%)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-neutral-600 font-primary">
                {stats.rank}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={fetchStudentStats}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </FadeInScroll>

      {/* XP Progress Bar */}
      <FadeInScroll>
        <Card className="overflow-hidden border-0 shadow-elevation-2">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-display">
                  المستوى {stats.level} • {stats.currentXP.toLocaleString()} XP
                </h3>
                <p className="text-white/80 font-primary">
                  {stats.nextLevelXP - stats.currentXP} XP متبقية للمستوى التالي
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-display">
                  #{stats.monthlyRank}
                </div>
                <p className="text-white/80 text-sm font-primary">
                  ترتيبك الشهري
                </p>
              </div>
            </div>

            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateXPProgress()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </Card>
      </FadeInScroll>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الدورات المسجلة
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalEnrolledCourses}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCourses} مكتملة • {stats.inProgressCourses} قيد
              التقدم
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.averageProgress.toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.averageProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وقت التعلم</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatWatchTime(stats.totalWatchTime)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي وقت المشاهدة</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشهادات</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.certificatesEarned}
            </div>
            <p className="text-xs text-muted-foreground">شهادة مكتسبة</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="courses">دوراتي</TabsTrigger>
          <TabsTrigger value="progress">التقدم</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="recommended">مقترحة</TabsTrigger>
          <TabsTrigger value="certificates">الشهادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  النشاط الحديث
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.type === "lesson_complete" && (
                          <BookOpen className="h-5 w-5 text-green-600" />
                        )}
                        {activity.type === "course_enroll" && (
                          <Users className="h-5 w-5 text-blue-600" />
                        )}
                        {activity.type === "certificate_earned" && (
                          <Award className="h-5 w-5 text-yellow-600" />
                        )}
                        {activity.type === "quiz_passed" && (
                          <Target className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {activity.type === "lesson_complete" &&
                            `أكملت درس: ${activity.lessonName}`}
                          {activity.type === "course_enroll" &&
                            `سجلت في دورة: ${activity.courseName}`}
                          {activity.type === "certificate_earned" &&
                            `حصلت على شهادة: ${activity.courseName}`}
                          {activity.type === "quiz_passed" &&
                            `نجحت في اختبار: ${activity.courseName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString(
                            "ar-SA"
                          )}
                        </p>
                      </div>
                      {activity.progress && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {activity.progress}%
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  الإنجازات الحديثة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.achievements.slice(0, 4).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.category === "completion" && "إكمال"}
                        {achievement.category === "streak" && "استمرارية"}
                        {achievement.category === "engagement" && "تفاعل"}
                        {achievement.category === "excellence" && "تميز"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <EnrolledCourses />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <StudentProgress />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <RecommendedCourses />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <StudentCertificates />
        </TabsContent>
      </Tabs>
    </div>
  );
}