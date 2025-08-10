// src/components/student/recommended-courses/RecommendationsHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function RecommendationsHeader() {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            الدورات المقترحة لك
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          دورات مختارة بعناية تناسب اهتماماتك ومستواك التعليمي، مع توصيات ذكية لتسريع رحلتك التعليمية
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-1">مخصصة لك</h3>
              <p className="text-sm text-blue-700">بناءً على تقدمك واهتماماتك</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-1">الأكثر رواجاً</h3>
              <p className="text-sm text-green-700">الدورات الأكثر طلباً حالياً</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-1">عالية الجودة</h3>
              <p className="text-sm text-purple-700">من أفضل المدربين المعتمدين</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}