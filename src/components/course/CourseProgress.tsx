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
  Trophy, Star, Flame, Target, Clock, Award, Zap, Shield, Rocket, Brain,
  Sparkles, TrendingUp, BarChart3, CheckCircle, Play, BookOpen, Share2, Plus, ChevronRight
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
  userId: string;
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
  reward: { xp: number; badge?: string };
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
  courseId, courseName, overallProgress, completedCount, totalLessons,
  totalWatchedTime, totalDuration, currentStreak, longestStreak,
  studyGoals, achievements, learningPath, userId,
  onGoalCreate, onCertificateGenerate
}: CourseProgressProps) {
  const { shouldReduceMotion } = useOptimizedMotion();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'goals' | 'path'>('overview');
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const completionRate = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const avgSessionTime = totalWatchedTime > 0 ? totalWatchedTime / completedCount || 0 : 0;
  const estTimeRemaining = totalDuration - totalWatchedTime;
  const dailyAvg = currentStreak > 0 ? totalWatchedTime / currentStreak : 0;
  
  const currentXP = Math.floor(totalWatchedTime * 2 + completedCount * 50 + currentStreak * 25);
  const level = Math.floor(currentXP / 1000) + 1;
  const xpToNext = (level * 1000) - currentXP;
  const xpProgress = ((currentXP % 1000) / 1000) * 100;

  useEffect(() => {
    const loadMilestones = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/milestones?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setMilestones(data.milestones || []);
        }
      } catch (error) {
        console.error('Failed to load milestones:', error);
        setMilestones([]);
      }
    };
    if (userId && courseId) loadMilestones();
  }, [userId, courseId, completedCount, currentStreak, completionRate]);

  useEffect(() => {
    const completedMs = milestones.filter(m => m.progress >= m.target);
    if (completedMs.length > 0 && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [milestones, showCelebration]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'text-neutral-600 bg-neutral-100 border-neutral-200',
      rare: 'text-blue-600 bg-blue-100 border-blue-200',
      epic: 'text-purple-600 bg-purple-100 border-purple-200',
      legendary: 'text-yellow-600 bg-yellow-100 border-yellow-200'
    };
    return colors[rarity] || colors.common;
  };

  const getPriorityColor = (priority: StudyGoal['priority']) => {
    const colors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-green-200 bg-green-50'
    };
    return colors[priority] || 'border-neutral-200 bg-neutral-50';
  };

  const StatCard = ({ icon: Icon, title, value, desc, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold font-display">{title}</h3>
            <p className="text-2xl font-bold font-display" style={{color: color.includes('blue') ? '#2563eb' : color.includes('green') ? '#16a34a' : '#9333ea'}}>
              {value}
            </p>
          </div>
        </div>
        <p className="text-sm text-neutral-600 font-primary">{desc}</p>
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'achievements', label: 'الإنجازات', icon: Trophy },
    { id: 'goals', label: 'الأهداف', icon: Target },
    { id: 'path', label: 'مسار التعلم', icon: BookOpen }
  ];

  return (
    <div className="space-y-6">
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
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">🎉 تهانينا!</h2>
              <p className="text-neutral-600 font-primary mb-4">لقد حققت إنجازاً جديداً في رحلتك التعليمية</p>
              <Button onClick={() => setShowCelebration(false)}>متابعة التعلم</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeInScroll>
        <Card className="overflow-hidden border-0 shadow-elevation-3">
          <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-6 text-white relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 font-display leading-arabic-tight">{courseName}</h2>
                  <p className="text-white/90 font-primary">المستوى {level} • {currentXP.toLocaleString()} XP</p>
                </div>
                
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                      <span className="text-xl font-bold font-display">{level}</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 border-4 border-white/30 rounded-full"
                      style={{ background: `conic-gradient(from 0deg, white ${xpProgress}%, transparent ${xpProgress}%)` }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-white/80 font-primary">{xpToNext} XP للمستوى التالي</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-primary">التقدم الإجمالي</span>
                  <span className="font-semibold font-primary">{completedCount} / {totalLessons} دروس ({Math.round(completionRate)}%)</span>
                </div>
                <Progress value={completionRate} className="h-3 bg-white/20" />
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: Flame, value: currentStreak, label: 'يوم متتالي' },
                    { icon: Clock, value: Math.round(totalWatchedTime / 60), label: 'دقيقة مشاهدة' },
                    { icon: Trophy, value: achievements.filter(a => a.earned).length, label: 'إنجاز' },
                    { icon: Target, value: studyGoals.filter(g => g.completed).length, label: 'هدف محقق' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-2 mx-auto">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-lg font-bold font-display">{stat.value}</div>
                      <p className="text-white/80 text-xs font-primary">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </FadeInScroll>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
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

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  المعالم والإنجازات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestones.map((ms) => (
                    <StaggerItem key={ms.id}>
                      <Card className="p-4 hover:shadow-elevation-2 transition-all duration-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", ms.color)}>
                            <ms.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold font-display leading-arabic-tight">{ms.title}</h4>
                            <p className="text-sm text-neutral-600 font-primary">{ms.description}</p>
                          </div>
                          {ms.progress >= ms.target && <CheckCircle className="w-5 h-5 text-success" />}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-primary">{Math.min(ms.progress, ms.target)} / {ms.target}</span>
                            <Badge variant="secondary" className="text-xs">{ms.reward}</Badge>
                          </div>
                          <Progress value={(ms.progress / ms.target) * 100} className="h-2" />
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={TrendingUp} 
                title="معدل التقدم" 
                value={`${Math.round(dailyAvg)} دقيقة/يوم`}
                desc="متوسط وقت الدراسة اليومي"
                color="bg-blue-100 text-blue-600"
              />
              <StatCard 
                icon={Clock} 
                title="الوقت المتبقي" 
                value={`${Math.round(estTimeRemaining / 60)} ساعة`}
                desc="تقدير لإكمال الدورة"
                color="bg-green-100 text-green-600"
              />
              <StatCard 
                icon={Zap} 
                title="أطول Streak" 
                value={`${longestStreak} يوم`}
                desc="أطول فترة دراسة متواصلة"
                color="bg-purple-100 text-purple-600"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
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
                  {achievements.map((ach) => (
                    <StaggerItem key={ach.id}>
                      <motion.div
                        className={cn("p-4 rounded-lg border-2 transition-all duration-200",
                          ach.earned ? getRarityColor(ach.rarity) + " shadow-elevation-2" : "border-neutral-200 bg-neutral-50 opacity-60")}
                        whileHover={ach.earned ? { scale: 1.02 } : {}}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center",
                            ach.earned ? "bg-white/50" : "bg-neutral-200")}>
                            <ach.icon className={cn("w-6 h-6", ach.earned ? "text-current" : "text-neutral-400")} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold font-display leading-arabic-tight">{ach.title}</h4>
                            <p className="text-sm opacity-80 font-primary">{ach.description}</p>
                          </div>
                        </div>
                        
                        {ach.earned ? (
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">+{ach.xpReward} XP</Badge>
                            <span className="text-xs opacity-70 font-primary">
                              {ach.earnedDate && new Date(ach.earnedDate).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {ach.progress !== undefined && ach.maxProgress && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-primary">{ach.progress} / {ach.maxProgress}</span>
                                  <span className="text-xs opacity-70 font-primary">
                                    {Math.round((ach.progress / ach.maxProgress) * 100)}%
                                  </span>
                                </div>
                                <Progress value={(ach.progress / ach.maxProgress) * 100} className="h-1" />
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
          <motion.div key="goals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
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
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center",
                              goal.completed ? "bg-success text-white" : "bg-white")}>
                              {goal.completed ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5 text-neutral-600" />}
                            </div>
                            <div>
                              <h4 className="font-semibold font-display leading-arabic-tight">{goal.title}</h4>
                              <p className="text-sm text-neutral-600 font-primary">{goal.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'} className="text-xs mb-2">
                              {goal.priority === 'high' ? 'عالي' : goal.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <p className="text-xs text-neutral-500 font-primary">
                              {new Date(goal.deadline).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-primary">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                            <span className="font-semibold font-primary">{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                          </div>
                          <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
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
          <motion.div key="path" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  مسار التعلم التفاعلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath.map((node, idx) => (
                    <motion.div
                      key={node.id}
                      className={cn("flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200",
                        node.completed ? "border-success bg-success/5" : node.locked ? "border-neutral-200 bg-neutral-50 opacity-50" : "border-primary-200 bg-primary-50 hover:shadow-elevation-1")}
                      whileHover={!node.locked ? { scale: 1.01 } : {}}
                    >
                      {idx < learningPath.length - 1 && <div className="absolute left-8 top-16 w-0.5 h-8 bg-neutral-200" />}
                      
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center relative z-10",
                        node.completed ? "bg-success text-white" : node.locked ? "bg-neutral-200 text-neutral-400" : "bg-primary-500 text-white")}>
                        {node.completed ? <CheckCircle className="w-6 h-6" /> : 
                         node.type === 'lesson' ? <Play className="w-6 h-6" /> : 
                         node.type === 'quiz' ? <Brain className="w-6 h-6" /> : 
                         node.type === 'project' ? <Rocket className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold font-display leading-arabic-tight">{node.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {node.type === 'lesson' ? 'درس' : node.type === 'quiz' ? 'اختبار' : node.type === 'project' ? 'مشروع' : 'معلم'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">+{node.xpReward} XP</Badge>
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

      <div className="flex items-center gap-4">
        <Button onClick={onCertificateGenerate} disabled={completionRate < 100} className="flex-1">
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
