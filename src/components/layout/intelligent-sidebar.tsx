// Intelligent sidebar with AI-powered features
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Award,
  Settings,
  HelpCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Brain,
  Star,
  Activity,
  Bell,
  Menu,
  X
} from "lucide-react";
import { InstantLink } from "@/components/ui/instant-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOptimizedMotion } from "@/hooks/useAnimations";
import { fadeInUp, slideInRight } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  description?: string;
  isNew?: boolean;
  aiRecommended?: boolean;
  lastVisited?: Date;
  category: 'main' | 'learning' | 'profile' | 'settings';
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'achievement' | 'reminder' | 'tip';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  priority: 'high' | 'medium' | 'low';
  icon: React.ElementType;
}

export const IntelligentSidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  className
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { shouldReduceMotion } = useOptimizedMotion();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredItems, setFilteredItems] = React.useState<NavigationItem[]>([]);

  // Navigation items with AI-powered insights
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'لوحة التحكم',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'نظرة عامة على تقدمك',
      category: 'main',
      aiRecommended: true
    },
    {
      id: 'courses',
      name: 'دوراتي',
      href: '/courses',
      icon: BookOpen,
      badge: 3,
      description: 'الدورات المسجل بها',
      category: 'learning',
      lastVisited: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 'progress',
      name: 'التقدم',
      href: '/progress',
      icon: TrendingUp,
      description: 'تتبع إنجازاتك',
      category: 'learning',
      isNew: true
    },
    {
      id: 'certificates',
      name: 'الشهادات',
      href: '/certificates',
      icon: Award,
      badge: 2,
      description: 'شهاداتك المحققة',
      category: 'learning'
    },
    {
      id: 'goals',
      name: 'الأهداف',
      href: '/goals',
      icon: Target,
      description: 'أهدافك التعليمية',
      category: 'learning',
      aiRecommended: true
    },
    {
      id: 'profile',
      name: 'الملف الشخصي',
      href: '/profile',
      icon: User,
      description: 'معلوماتك الشخصية',
      category: 'profile'
    },
    {
      id: 'settings',
      name: 'الإعدادات',
      href: '/settings',
      icon: Settings,
      description: 'إعدادات الحساب',
      category: 'settings'
    },
    {
      id: 'help',
      name: 'المساعدة',
      href: '/help',
      icon: HelpCircle,
      description: 'الدعم والمساعدة',
      category: 'settings'
    }
  ];

  // AI-powered insights (mock data - in real app, this would come from AI service)
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'recommendation',
      title: 'دورة موصى بها',
      description: 'بناءً على تقدمك، ننصحك بدورة "React المتقدم"',
      action: { label: 'عرض الدورة', href: '/courses/react-advanced' },
      priority: 'high',
      icon: Sparkles
    },
    {
      id: '2',
      type: 'achievement',
      title: 'إنجاز جديد!',
      description: 'أكملت 80% من دورة JavaScript',
      priority: 'medium',
      icon: Star
    },
    {
      id: '3',
      type: 'reminder',
      title: 'تذكير',
      description: 'لم تدخل منذ 3 أيام. استكمل تعلمك!',
      action: { label: 'متابعة التعلم', href: '/courses' },
      priority: 'low',
      icon: Clock
    }
  ];

  // Filter navigation items based on search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(navigationItems);
    } else {
      const filtered = navigationItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery]);

  // Get recently visited items
  const recentItems = navigationItems
    .filter(item => item.lastVisited)
    .sort((a, b) => (b.lastVisited?.getTime() || 0) - (a.lastVisited?.getTime() || 0))
    .slice(0, 3);

  // Get AI recommended items
  const recommendedItems = navigationItems.filter(item => item.aiRecommended);

  const NavigationItem: React.FC<{ item: NavigationItem; isCompact?: boolean }> = ({ 
    item, 
    isCompact = false 
  }) => {
    const isActive = pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <motion.div
        whileHover={shouldReduceMotion ? {} : { x: 4 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <InstantLink
          href={item.href}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-primary relative",
            isActive
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
            isCompact && "justify-center px-2"
          )}
          preloadOnHover
        >
          <div className="relative">
            <Icon className={cn(
              "flex-shrink-0 transition-colors",
              isActive ? "text-primary-600" : "text-neutral-500 group-hover:text-neutral-700",
              "h-5 w-5"
            )} />
            
            {/* AI recommendation indicator */}
            {item.aiRecommended && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {!isCompact && (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium leading-arabic-tight truncate">
                    {item.name}
                  </span>
                  {item.isNew && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      جديد
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-neutral-500 leading-arabic-normal truncate">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Badge or indicator */}
              {item.badge && (
                <Badge variant="default" className="text-xs">
                  {item.badge}
                </Badge>
              )}

              {isActive && (
                <motion.div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </>
          )}
        </InstantLink>
      </motion.div>
    );
  };

  const AIInsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
    const Icon = insight.icon;
    const priorityColors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-blue-200 bg-blue-50'
    };

    return (
      <motion.div
        className={cn(
          "p-3 rounded-lg border transition-all duration-200 hover:shadow-elevation-2",
          priorityColors[insight.priority]
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
      >
        <div className="flex items-start gap-2">
          <Icon className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-neutral-900 font-display leading-arabic-tight">
              {insight.title}
            </h4>
            <p className="text-xs text-neutral-600 mt-1 font-primary leading-arabic-normal">
              {insight.description}
            </p>
            {insight.action && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-6 px-2 text-xs"
                asChild
              >
                <InstantLink href={insight.action.href} preloadOnHover>
                  {insight.action.label}
                </InstantLink>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-neutral-200 z-50 flex flex-col",
          "lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]",
          className
        )}
        initial={false}
        animate={{
          width: isOpen ? 280 : 64,
          x: isOpen ? 0 : -216 // Only hide on mobile
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          duration: 0.3
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          {isOpen && (
            <motion.div
              className="flex items-center gap-2"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Brain className="h-5 w-5 text-primary-600" />
              <span className="font-semibold text-neutral-900 font-display">
                المساعد الذكي
              </span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1.5 h-auto"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search */}
        {isOpen && (
          <motion.div
            className="p-4 border-b border-neutral-200"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-primary focus:outline-none focus:bg-white focus:border-primary-300 transition-all duration-200"
              />
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* AI Insights */}
          {isOpen && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 font-display flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary-600" />
                رؤى ذكية
              </h3>
              <div className="space-y-2">
                {aiInsights.slice(0, 2).map((insight) => (
                  <AIInsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {isOpen && recentItems.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-600" />
                الأخيرة
              </h3>
              <div className="space-y-1">
                {recentItems.map((item) => (
                  <NavigationItem key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Main Navigation */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            {isOpen && (
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 font-display">
                التنقل الرئيسي
              </h3>
            )}
            <div className="space-y-1">
              {(searchQuery ? filteredItems : navigationItems).map((item) => (
                <NavigationItem 
                  key={item.id} 
                  item={item} 
                  isCompact={!isOpen}
                />
              ))}
            </div>
          </motion.div>

          {/* User Progress */}
          {isOpen && session && (
            <motion.div
              className="p-3 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-200"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900 font-display">
                  تقدمك الأسبوعي
                </span>
              </div>
              <Progress value={75} className="mb-2" />
              <p className="text-xs text-primary-700 font-primary">
                75% من هدفك الأسبوعي (15 ساعة)
              </p>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
};