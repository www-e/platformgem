// src/components/course/CourseProgress.tsx - Gamified Course Progress System
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FadeInScroll, StaggerChildren, StaggerItem } from "@/components/ui/micro-interactions";
import { useOptimizedMotion } from "@/hooks/useAnimations";
import {
  Trophy,
  Star,
  Flame,
  Target,
  Calendar,
  Clock,
  Award,
  Zap,
  Crown,
  Gem,
  Shield,
  Rocket,
  Brain,
  Heart,
  Zap,
  Sparkles,
  Medal,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Play,
  BookOpen,
  Users,
  Share2,
  Download,
  Gift,
  Bookmark,
  Eye,
  ArrowUp,
  Plus,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseProgressProps {
  courseId: string;
  courseName: string;
  overallProgress: number;
  completedCount: number;
  totalLessons: number;
  totalWatchedTime: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  studyGoals: StudyGoal[];
  achievements: Achievement[];
  learningPath: LearningPathNode[];
  onGoalCreate?: (goal: Partial<StudyGoal>) => void;
  onCertificateGenerate?: () => void;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: 'time' | 'lessons' | 'streak' | 'completion';
  completed: boolean;
  reward: {
    xp: number;
    badge?: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  category: 'learning' | 'social' | 'streak' | 'completion' | 'special';
}

interface LearningPathNode {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'project' | 'milestone';
  completed: boolean;
  locked: boolean;
  estimatedTime: number;
  xpReward: number;
  dependencies: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  icon: React.ElementType;
  color: string;
}

export function CourseProgress({
  courseId,
  courseName,
  overallProgress,
  completedCount,
  totalLessons,
  totalWatchedTime,
  totalDuration,
  currentStreak,
  longestStreak,
  studyGoals,
  achievements,
  learningPath,
  onGoalCreate,
  onCertificateGenerate
}: CourseProgressProps) {
  const { shouldReduceMotion } = useOptimizedMotion();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'goals' | 'path'>('overview');
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Calculate derived metrics
  const completionRate = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const averageSessionTime = totalWatchedTime > 0 ? totalWatchedTime / completedCount || 0 : 0;
  const estimatedTimeToComplete = totalDuration - totalWatchedTime;
  const dailyAverage = currentStreak > 0 ? totalWatchedTime / currentStreak : 0;
  
  // XP and Level System
  const currentXP = Math.floor(totalWatchedTime * 2 + completedCount * 50 + currentStreak * 25);
  const level = Math.floor(currentXP / 1000) + 1;
  const xpToNextLevel = (level * 1000) - currentXP;
  const xpProgress = ((currentXP % 1000) / 1000) * 100;

  // Load user milestones
  useEffect(() => {
    const loadMilestones = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/milestones?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMilestones(data.milestones || []);
        }
      } catch (error) {
        console.error('Failed to load milestones:', error);
        setMilestones([]);
      }
    };

    if (userId && courseId) {
      loadMilestones();
    }
  }, [userId, courseId, completedCount, currentStreak, completionRate]);

  // Check for milestone completions
  useEffect(() => {
    const completedMilestones = milestones.filter(m => m.progress >= m.target);
    if (completedMilestones.length > 0 && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [milestones, showCelebration]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-neutral-600 bg-neutral-100 border-neutral-200';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'epic': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-neutral-600 bg-neutral-100 border-neutral-200';
    }
  };

  const getPriorityColor = (priority: StudyGoal['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-neutral-200 bg-neutral-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
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
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                🎉 تهانينا!
              </h2>
              <p className="text-neutral-600 font-primary mb-4">
                لقد حققت إنجازاً جديداً في رحلتك التعليمية
              </p>
              <Button onClick={() => setShowCelebration(false)}>
                متابعة التعلم
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Overview Card */}
      <FadeInScroll>
        <Card className="overflow-hidden border-0 shadow-elevation-3">
          <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-6 text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 font-display leading-arabic-tight">
                    {courseName}
                  </h2>
                  <p className="text-white/90 font-primary">
                    المستوى {level} • {currentXP.toLocaleString()} XP
                  </p>
                </div>
                
                {/* Level Badge */}
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                      <span className="text-xl font-bold font-display">{level}</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 border-4 border-white/30 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, white ${xpProgress}%, transparent ${xpProgress}%)`
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-white/80 font-primary">
                    {xpToNextLevel} XP للمستوى التالي
                  </p>
                </div>
              </div>
              
              {/* Main Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-primary">التقدم الإجمالي</span>
                  <span className="font-semibold font-primary">
                    {completedCount} / {totalLessons} دروس ({Math.round(completionRate)}%)
                  </span>
                </div>
                <Progress value={completionRate} className="h-3 bg-white/20" />
                
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-2 mx-auto">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-bold font-display">{currentStreak}</div>
                    <p className="text-white/80 text-xs font-primary">يوم متتالي</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-2 mx-auto">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-bold font-display">
                      {Math.round(totalWatchedTime / 60)}
                    </div>
                    <p className="text-white/80 text-xs font-primary">دقيقة مشاهدة</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-2 mx-auto">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-bold font-display">
                      {achievements.filter(a => a.earned).length}
                    </div>
                    <p className="text-white/80 text-xs font-primary">إنجاز</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-2 mx-auto">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-bold font-display">
                      {studyGoals.filter(g => g.completed).length}
                    </div>
                    <p className="text-white/80 text-xs font-primary">هدف محقق</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </FadeInScroll>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { id: 'achievements', label: 'الإنجازات', icon: Trophy },
          { id: 'goals', label: 'الأهداف', icon: Target },
          { id: 'path', label: 'مسار التعلم', icon: BookOpen }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'outline'}
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
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  المعالم والإنجازات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestones.map((milestone) => (
                    <StaggerItem key={milestone.id}>
                      <Card className="p-4 hover:shadow-elevation-2 transition-all duration-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", milestone.color)}>
                            <milestone.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold font-display leading-arabic-tight">
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-neutral-600 font-primary">
                              {milestone.description}
                            </p>
                          </div>
                          {milestone.progress >= milestone.target && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-primary">
                              {Math.min(milestone.progress, milestone.target)} / {milestone.target}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {milestone.reward}
                            </Badge>
                          </div>
                          <Progress 
                            value={(milestone.progress / milestone.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </CardContent>
            </Card>

            {/* Study Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-display">معدل التقدم</h3>
                      <p className="text-2xl font-bold text-blue-600 font-display">
                        {Math.round(dailyAverage)} دقيقة/يوم
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    متوسط وقت الدراسة اليومي
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-display">الوقت المتبقي</h3>
                      <p className="text-2xl font-bold text-green-600 font-display">
                        {Math.round(estimatedTimeToComplete / 60)} ساعة
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    تقدير لإكمال الدورة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-display">أطول Streak</h3>
                      <p className="text-2xl font-bold text-purple-600 font-display">
                        {longestStreak} يوم
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 font-primary">
                    أطول فترة دراسة متواصلة
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-display">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary-600" />
                    الإنجازات ({achievements.filter(a => a.earned).length}/{achievements.length})
                  </div>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 ml-2" />
                    مشاركة الإنجازات
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <StaggerItem key={achievement.id}>
                      <motion.div
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-200",
                          achievement.earned 
                            ? getRarityColor(achievement.rarity) + " shadow-elevation-2" 
                            : "border-neutral-200 bg-neutral-50 opacity-60"
                        )}
                        whileHover={achievement.earned ? { scale: 1.02 } : {}}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            achievement.earned ? "bg-white/50" : "bg-neutral-200"
                          )}>
                            <achievement.icon className={cn(
                              "w-6 h-6",
                              achievement.earned ? "text-current" : "text-neutral-400"
                            )} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold font-display leading-arabic-tight">
                              {achievement.title}
                            </h4>
                            <p className="text-sm opacity-80 font-primary">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        
                        {achievement.earned ? (
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.xpReward} XP
                            </Badge>
                            <span className="text-xs opacity-70 font-primary">
                              {achievement.earnedDate && new Date(achievement.earnedDate).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {achievement.progress !== undefined && achievement.maxProgress && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-primary">
                                    {achievement.progress} / {achievement.maxProgress}
                                  </span>
                                  <span className="text-xs opacity-70 font-primary">
                                    {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(achievement.progress / achievement.maxProgress) * 100} 
                                  className="h-1"
                                />
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-display">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    أهداف الدراسة ({studyGoals.filter(g => g.completed).length}/{studyGoals.length})
                  </div>
                  <Button size="sm" onClick={() => onGoalCreate?.({})}>
                    <Plus className="w-4 h-4 ml-2" />
                    هدف جديد
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaggerChildren className="space-y-4">
                  {studyGoals.map((goal) => (
                    <StaggerItem key={goal.id}>
                      <Card className={cn("p-4", getPriorityColor(goal.priority))}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              goal.completed ? "bg-success text-white" : "bg-white"
                            )}>
                              {goal.completed ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Target className="w-5 h-5 text-neutral-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold font-display leading-arabic-tight">
                                {goal.title}
                              </h4>
                              <p className="text-sm text-neutral-600 font-primary">
                                {goal.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs mb-2"
                            >
                              {goal.priority === 'high' ? 'عالي' : goal.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <p className="text-xs text-neutral-500 font-primary">
                              {new Date(goal.deadline).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-primary">
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </span>
                            <span className="font-semibold font-primary">
                              {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(goal.currentValue / goal.targetValue) * 100} 
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span className="font-primary">المكافأة: +{goal.reward.xp} XP</span>
                            <span className="font-primary">
                              {Math.ceil((goal.targetValue - goal.currentValue) / (goal.currentValue / (Date.now() - new Date(goal.deadline).getTime()) * 86400000))} يوم متبقي
                            </span>
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

        {activeTab === 'path' && (
          <motion.div
            key="path"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  مسار التعلم التفاعلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath.map((node, index) => (
                    <motion.div
                      key={node.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200",
                        node.completed 
                          ? "border-success bg-success/5" 
                          : node.locked 
                          ? "border-neutral-200 bg-neutral-50 opacity-50" 
                          : "border-primary-200 bg-primary-50 hover:shadow-elevation-1"
                      )}
                      whileHover={!node.locked ? { scale: 1.01 } : {}}
                    >
                      {/* Connection Line */}
                      {index < learningPath.length - 1 && (
                        <div className="absolute left-8 top-16 w-0.5 h-8 bg-neutral-200" />
                      )}
                      
                      {/* Node Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center relative z-10",
                        node.completed 
                          ? "bg-success text-white" 
                          : node.locked 
                          ? "bg-neutral-200 text-neutral-400" 
                          : "bg-primary-500 text-white"
                      )}>
                        {node.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : node.type === 'lesson' ? (
                          <Play className="w-6 h-6" />
                        ) : node.type === 'quiz' ? (
                          <Brain className="w-6 h-6" />
                        ) : node.type === 'project' ? (
                          <Rocket className="w-6 h-6" />
                        ) : (
                          <Trophy className="w-6 h-6" />
                        )}
                      </div>
                      
                      {/* Node Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold font-display leading-arabic-tight">
                            {node.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {node.type === 'lesson' ? 'درس' : node.type === 'quiz' ? 'اختبار' : node.type === 'project' ? 'مشروع' : 'معلم'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              +{node.xpReward} XP
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-primary">{node.estimatedTime} دقيقة</span>
                          </div>
                          {node.dependencies.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              <span className="font-primary">يتطلب {node.dependencies.length} متطلب</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      {!node.locked && !node.completed && (
                        <Button size="sm" variant="outline">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={onCertificateGenerate}
          disabled={completionRate < 100}
          className="flex-1"
        >
          <Award className="w-4 h-4 ml-2" />
          {completionRate >= 100 ? 'تحميل الشهادة' : `أكمل ${Math.round(100 - completionRate)}% للحصول على الشهادة`}
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 ml-2" />
          مشاركة التقدم
        </Button>
      </div>
    </div>
  );
}