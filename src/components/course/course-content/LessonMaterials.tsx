// src/components/course/course-content/LessonMaterials.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, BookOpen, Eye, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";

// FIX: Made the 'type' property a flexible string to match incoming data.
interface Material {
  id: string;
  title: string;
  type?: string; // Changed from enum to optional string
  url: string;
  size?: string;
  description?: string;
}

interface LessonMaterialsProps {
  materials: Material[];
  className?: string;
}

export function LessonMaterials({ materials, className }: LessonMaterialsProps) {
  const getIcon = (type?: string) => {
    if (!type) return FileText;
    if (type.includes('pdf')) return FileText;
    if (type.includes('doc')) return FileText;
    if (type.includes('video')) return Video;
    if (type.includes('image')) return ImageIcon;
    if (type.includes('link')) return LinkIcon;
    return FileText;
  };

  const getTypeLabel = (type?: string) => {
    if (!type) return 'ملف';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('doc')) return 'مستند';
    if (type.includes('video')) return 'فيديو';
    if (type.includes('image')) return 'صورة';
    if (type.includes('link')) return 'رابط';
    return 'ملف';
  };

  const handleAction = (material: Material) => {
    window.open(material.url, '_blank');
  };

  if (!materials || materials.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            مواد الدرس
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-neutral-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد مواد إضافية لهذا الدرس</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            مواد الدرس ({materials.length})
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {materials.map((material, index) => {
            const Icon = getIcon(material.type);
            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-neutral-900 dark:text-black">
                      {material.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(material.type)}
                      </Badge>
                      {material.size && (
                        <span className="text-xs text-neutral-500">
                          {material.size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(material)}
                    className="h-8 px-2"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}