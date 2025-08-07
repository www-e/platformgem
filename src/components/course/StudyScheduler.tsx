// src/components/course/StudyScheduler.tsx - Personalized Learning Scheduler
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FadeInScroll,
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/micro-interactions";
import {
  Calendar,
  Clock,
  Bell,
  Target,
  Zap,
  Brain,
  Coffee,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudySchedulerProps {
  courseId: string;
  userId: string;
  onScheduleUpdate?: (schedule: StudySchedule) => void;
  onReminderCreate?: (reminder: StudyReminder) => void;
}

interface StudySchedule {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  dailyGoalMinutes: number;
  preferredTimes: TimeSlot[];
  weeklySchedule: WeeklySchedule;
  adaptiveSettings: AdaptiveSettings;
  notifications: NotificationSettings;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string;
  priority: "high" | "medium" | "low";
  type: "focus" | "review" | "practice" | "break";
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
  goalMinutes: number;
  restDay: boolean;
}

interface AdaptiveSettings {
  adjustBasedOnProgress: boolean;
  increaseOnSuccess: boolean;
  decreaseOnMissed: boolean;
  considerEnergyLevels: boolean;
  adaptToPerformance: boolean;
  maxDailyMinutes: number;
  minDailyMinutes: number;
}

interface NotificationSettings {
  enabled: boolean;
  pushNotifications: boolean;
  emailReminders: boolean;
  smsReminders: boolean;
  reminderMinutesBefore: number;
  motivationalMessages: boolean;
  progressUpdates: boolean;
  streakReminders: boolean;
}

interface StudyReminder {
  id: string;
  scheduleId: string;
  title: string;
  message: string;
  scheduledTime: string;
  type: "study" | "break" | "review" | "motivation" | "streak";
  priority: "high" | "medium" | "low";
  recurring: boolean;
  completed: boolean;
  snoozed: boolean;
  snoozeUntil?: string;
}

interface StudySession {
  id: string;
  scheduleId: string;
  startTime: string;
  endTime?: string;
  plannedDuration: number;
  actualDuration?: number;
  completed: boolean;
  productivity: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  notes?: string;
}

export function StudyScheduler({
  courseId,
  userId,
  onScheduleUpdate,
  onReminderCreate,
}: StudySchedulerProps) {
  const [activeTab, setActiveTab] = useState<
    "schedule" | "reminders" | "analytics" | "settings"
  >("schedule");
  const [currentSchedule, setCurrentSchedule] = useState<StudySchedule | null>(
    null
  );
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [selectedDay, setSelectedDay] =
    useState<keyof WeeklySchedule>("monday");

  // Load user's study schedule
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetch(`/api/study-schedule/${courseId}?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentSchedule(data.schedule);
          setReminders(data.reminders || []);
        }
      } catch (error) {
        console.error('Failed to load study schedule:', error);
        // Set empty schedule if loading fails
        setCurrentSchedule(null);
        setReminders([]);
      }
    };

    if (userId && courseId) {
      loadSchedule();
    }
  }, [userId, courseId]);

  const getDayName = (day: keyof WeeklySchedule) => {
    const dayNames = {
      monday: "الإثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد",
    };
    return dayNames[day];
  };

  const getTypeIcon = (type: TimeSlot["type"]) => {
    switch (type) {
      case "focus":
        return Brain;
      case "review":
        return BookOpen;
      case "practice":
        return Play;
      case "break":
        return Coffee;
      default:
        return Clock;
    }
  };

  const getTypeColor = (type: TimeSlot["type"]) => {
    switch (type) {
      case "focus":
        return "text-blue-600 bg-blue-100";
      case "review":
        return "text-green-600 bg-green-100";
      case "practice":
        return "text-purple-600 bg-purple-100";
      case "break":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-neutral-600 bg-neutral-100";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInScroll>
        <Card className="overflow-hidden border-0 shadow-elevation-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 font-display leading-arabic-tight">
                  مخطط الدراسة الذكي
                </h2>
                <p className="text-white/90 font-primary">
                  نظم وقتك وحقق أهدافك التعليمية بكفاءة
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="text-sm text-white/80 font-primary">
                  {currentSchedule?.active ? "نشط" : "غير نشط"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </FadeInScroll>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "schedule", label: "الجدول الأسبوعي", icon: Calendar },
          { id: "reminders", label: "التذكيرات", icon: Bell },
          { id: "analytics", label: "التحليلات", icon: BarChart3 },
          { id: "settings", label: "الإعدادات", icon: Settings },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "schedule" && currentSchedule && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Weekly Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-display">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    الجدول الأسبوعي
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {
                        Object.values(currentSchedule.weeklySchedule).filter(
                          (d) => d.enabled
                        ).length
                      }{" "}
                      أيام نشطة
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {Object.entries(currentSchedule.weeklySchedule).map(
                    ([day, schedule]) => (
                      <motion.button
                        key={day}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all duration-200",
                          selectedDay === day
                            ? "border-primary-500 bg-primary-50"
                            : schedule.enabled
                            ? "border-neutral-200 bg-white hover:border-primary-200"
                            : "border-neutral-200 bg-neutral-50 opacity-50"
                        )}
                        onClick={() =>
                          setSelectedDay(day as keyof WeeklySchedule)
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-sm font-semibold font-display mb-1">
                          {getDayName(day as keyof WeeklySchedule)}
                        </div>
                        <div className="text-xs text-neutral-600 font-primary">
                          {schedule.restDay
                            ? "راحة"
                            : `${schedule.goalMinutes} دقيقة`}
                        </div>
                        {schedule.enabled && !schedule.restDay && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full mx-auto mt-1" />
                        )}
                      </motion.button>
                    )
                  )}
                </div>

                {/* Selected Day Details */}
                <Card className="p-4 bg-neutral-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold font-display">
                      تفاصيل {getDayName(selectedDay)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          currentSchedule.weeklySchedule[selectedDay].enabled
                        }
                        onCheckedChange={(checked) => {
                          // Update schedule logic here
                        }}
                      />
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة جلسة
                      </Button>
                    </div>
                  </div>

                  {currentSchedule.weeklySchedule[selectedDay].restDay ? (
                    <div className="text-center py-8">
                      <Moon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-neutral-900 font-display mb-1">
                        يوم راحة
                      </h4>
                      <p className="text-sm text-neutral-600 font-primary">
                        خذ استراحة واستعد لأسبوع جديد من التعلم
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentSchedule.preferredTimes.map((timeSlot) => {
                        const TypeIcon = getTypeIcon(timeSlot.type);
                        return (
                          <div
                            key={timeSlot.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border",
                              getPriorityColor(timeSlot.priority)
                            )}
                          >
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                getTypeColor(timeSlot.type)
                              )}
                            >
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold font-display">
                                  {timeSlot.startTime} - {timeSlot.endTime}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {timeSlot.type === "focus"
                                    ? "تركيز"
                                    : timeSlot.type === "review"
                                    ? "مراجعة"
                                    : timeSlot.type === "practice"
                                    ? "تطبيق"
                                    : "استراحة"}
                                </Badge>
                                <Badge
                                  variant={
                                    timeSlot.priority === "high"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {timeSlot.priority === "high"
                                    ? "عالي"
                                    : timeSlot.priority === "medium"
                                    ? "متوسط"
                                    : "منخفض"}
                                </Badge>
                              </div>
                              <p className="text-sm text-neutral-600 font-primary">
                                مدة الجلسة:{" "}
                                {Math.round(
                                  (new Date(
                                    `2000-01-01T${timeSlot.endTime}`
                                  ).getTime() -
                                    new Date(
                                      `2000-01-01T${timeSlot.startTime}`
                                    ).getTime()) /
                                    60000
                                )}{" "}
                                دقيقة
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 font-display">
                    {currentSchedule.dailyGoalMinutes}
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    دقيقة يومياً
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 font-display">
                    {
                      Object.values(currentSchedule.weeklySchedule).filter(
                        (d) => d.enabled
                      ).length
                    }
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    أيام نشطة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 font-display">
                    {Object.values(currentSchedule.weeklySchedule).reduce(
                      (sum, day) => sum + day.goalMinutes,
                      0
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    دقيقة أسبوعياً
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Bell className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600 font-display">
                    {reminders.filter((r) => !r.completed).length}
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    تذكير نشط
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "reminders" && (
          <motion.div
            key="reminders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-display">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-600" />
                    التذكيرات النشطة (
                    {reminders.filter((r) => !r.completed).length})
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 ml-2" />
                    تذكير جديد
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaggerChildren className="space-y-4">
                  {reminders.map((reminder) => (
                    <StaggerItem key={reminder.id}>
                      <Card
                        className={cn(
                          "p-4",
                          getPriorityColor(reminder.priority)
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              reminder.completed
                                ? "bg-success text-white"
                                : "bg-white"
                            )}
                          >
                            {reminder.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : reminder.type === "study" ? (
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            ) : reminder.type === "break" ? (
                              <Coffee className="w-5 h-5 text-orange-600" />
                            ) : (
                              <Bell className="w-5 h-5 text-neutral-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold font-display leading-arabic-tight">
                                {reminder.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {new Date(
                                    reminder.scheduledTime
                                  ).toLocaleTimeString("ar-EG", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Badge>
                                {reminder.recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    متكرر
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-neutral-700 leading-arabic-relaxed font-primary mb-3">
                              {reminder.message}
                            </p>
                            <div className="flex items-center gap-2">
                              {!reminder.completed && (
                                <>
                                  <Button size="sm" variant="outline">
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    تم
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Clock className="w-4 h-4 ml-2" />
                                    تأجيل
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
