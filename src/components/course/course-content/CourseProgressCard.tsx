// src/components/course/course-content/CourseProgressCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Award, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface CourseProgressCardProps {
  completedLessons: number;
  totalLessons: number;
  totalWatchTime: number;
  estimatedTime: number;
  currentStreak: number;
  xpEarned: number;
  className?: string;
}

export function CourseProgressCard({
  completedLessons,
  totalLessons,
  totalWatchTime,
  estimatedTime,
  currentStreak,
  xpEarned,
  className
}: CourseProgressCardProps) {
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const timeProgress = estimatedTime > 0 ? (totalWatchTime / estimatedTime) * 100 : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            تقدمك في الدورة
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedLessons}/{totalLessons} دروس
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              نسبة الإكمال
            </span>
            <span className="text-sm font-bold text-primary-600">
              {completionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Watch Time */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                وقت المشاهدة
              </span>
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatTime(totalWatchTime)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              من أصل {formatTime(estimatedTime)}
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                Streak الحالي
              </span>
            </div>
            <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
              {currentStreak} أيام
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              استمر في التعلم!
            </div>
          </motion.div>

          {/* XP Earned */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                نقاط الخبرة
              </span>
            </div>
            <div className="text-lg font-bold text-green-900 dark:text-green-100">
              {xpEarned.toLocaleString()} XP
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              +50 XP للدرس التالي
            </div>
          </motion.div>

          {/* Completion Status */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                معدل التقدم
              </span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {completionRate >= 100 ? 'مكتمل' : 'جاري'}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              {totalLessons - completedLessons} دروس متبقية
            </div>
          </motion.div>
        </div>

        {/* Achievement Indicator */}
        {completionRate >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white text-center"
          >
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold mb-1">تهانينا! 🎉</h3>
            <p className="text-sm opacity-90">
              لقد أكملت جميع دروس هذه الدورة بنجاح
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 bg-white/20 hover:bg-white/30 border-0"
            >
              احصل على الشهادة
            </Button>
          </motion.div>
        )}

        {/* Next Milestone */}
        {completionRate < 100 && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                الهدف التالي
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              أكمل {Math.min(5, totalLessons - completedLessons)} دروس إضافية للحصول على +100 XP
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}