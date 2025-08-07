// src/components/course/CertificateGenerator.tsx - Enhanced Certificate Generator
"use client";

import { useState, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeInScroll } from "@/components/ui/micro-interactions";
import {
  Award,
  Download,
  Share2,
  Star,
  Calendar,
  User,
  BookOpen,
  Trophy,
  Sparkles,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  Mail,
  Printer,
  Eye,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateGeneratorProps {
  courseId: string;
  courseName: string;
  completionRate: number;
  studentName?: string;
  instructorName?: string;
  completionDate?: string;
  certificateId?: string;
  grade?: string;
  studyHours?: number;
  onDownload?: (format: 'pdf' | 'png' | 'jpg') => void;
  onShare?: (platform: string) => void;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  premium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
}

export function CertificateGenerator({
  courseId,
  courseName,
  completionRate,
  studentName = "أحمد محمد علي",
  instructorName = "د. فاطمة أحمد",
  completionDate = new Date().toLocaleDateString('ar-EG'),
  certificateId = `CERT-${Date.now()}`,
  grade = "ممتاز",
  studyHours = 25,
  onDownload,
  onShare
}: CertificateGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const templates: CertificateTemplate[] = [
    {
      id: 'classic',
      name: 'كلاسيكي',
      description: 'تصميم تقليدي أنيق مع إطار ذهبي',
      preview: '/certificates/classic-preview.jpg',
      premium: false,
      colors: {
        primary: '#D4AF37',
        secondary: '#1F2937',
        accent: '#F59E0B',
        text: '#374151'
      }
    },
    {
      id: 'modern',
      name: 'عصري',
      description: 'تصميم حديث بألوان متدرجة',
      preview: '/certificates/modern-preview.jpg',
      premium: false,
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#60A5FA',
        text: '#1F2937'
      }
    },
    {
      id: 'elegant',
      name: 'أنيق',
      description: 'تصميم راقي مع زخارف إسلامية',
      preview: '/certificates/elegant-preview.jpg',
      premium: true,
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10B981',
        text: '#064E3B'
      }
    },
    {
      id: 'premium',
      name: 'بريميوم',
      description: 'تصميم فاخر مع تأثيرات ثلاثية الأبعاد',
      preview: '/certificates/premium-preview.jpg',
      premium: true,
      colors: {
        primary: '#7C3AED',
        secondary: '#5B21B6',
        accent: '#A855F7',
        text: '#4C1D95'
      }
    }
  ];

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600' }
  ];

  const handleGenerate = async (format: 'pdf' | 'png' | 'jpg') => {
    setIsGenerating(true);
    
    // Simulate certificate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onDownload?.(format);
    setIsGenerating(false);
  };

  const handleShare = (platform: string) => {
    onShare?.(platform);
    setShowShareModal(false);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/certificates/${certificateId}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate) || templates[0];

  if (completionRate < 100) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
            أكمل الدورة للحصول على الشهادة
          </h3>
          <p className="text-neutral-600 font-primary mb-4">
            تقدمك الحالي: {Math.round(completionRate)}%
          </p>
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
            <div 
              className="bg-primary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm text-neutral-500 font-primary">
            متبقي {Math.round(100 - completionRate)}% لإكمال الدورة والحصول على شهادة معتمدة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInScroll>
        <Card className="overflow-hidden border-0 shadow-elevation-3">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2 font-display leading-arabic-tight">
                    🎉 تهانينا!
                  </h2>
                  <p className="text-white/90 text-lg font-primary">
                    لقد أكملت الدورة بنجاح واستحققت الشهادة
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                    <Award className="w-10 h-10" />
                  </div>
                  <p className="text-sm text-white/80 font-primary">شهادة معتمدة</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </FadeInScroll>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-primary-600" />
            اختر تصميم الشهادة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className={cn(
                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                  selectedTemplate === template.id 
                    ? "border-primary-500 bg-primary-50" 
                    : "border-neutral-200 bg-white hover:border-primary-200"
                )}
                onClick={() => setSelectedTemplate(template.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {template.premium && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                      <Crown className="w-3 h-3 ml-1" />
                      بريميوم
                    </Badge>
                  </div>
                )}
                
                <div 
                  className="w-full h-24 rounded-lg mb-3 bg-gradient-to-br"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
                  }}
                />
                
                <h4 className="font-semibold font-display mb-1">{template.name}</h4>
                <p className="text-sm text-neutral-600 font-primary">{template.description}</p>
                
                {selectedTemplate === template.id && (
                  <motion.div
                    className="absolute inset-0 border-2 border-primary-500 rounded-lg bg-primary-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-display">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-600" />
              معاينة الشهادة
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'إخفاء المعاينة' : 'عرض المعاينة'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div 
                  ref={certificateRef}
                  className="w-full aspect-[4/3] rounded-lg shadow-elevation-3 p-8 text-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${selectedTemplateData.colors.primary}20, ${selectedTemplateData.colors.secondary}20)`
                  }}
                >
                  {/* Certificate Border */}
                  <div 
                    className="absolute inset-4 border-4 rounded-lg"
                    style={{ borderColor: selectedTemplateData.colors.primary }}
                  />
                  
                  {/* Certificate Content */}
                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <div className="mb-6">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: selectedTemplateData.colors.primary }}
                      >
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h1 
                        className="text-3xl font-bold font-display mb-2"
                        style={{ color: selectedTemplateData.colors.text }}
                      >
                        شهادة إتمام
                      </h1>
                      <p 
                        className="text-lg font-primary"
                        style={{ color: selectedTemplateData.colors.text }}
                      >
                        هذا يشهد بأن
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h2 
                        className="text-4xl font-bold font-display mb-4"
                        style={{ color: selectedTemplateData.colors.primary }}
                      >
                        {studentName}
                      </h2>
                      <p 
                        className="text-lg font-primary mb-2"
                        style={{ color: selectedTemplateData.colors.text }}
                      >
                        قد أكمل بنجاح دورة
                      </p>
                      <h3 
                        className="text-2xl font-bold font-display"
                        style={{ color: selectedTemplateData.colors.secondary }}
                      >
                        {courseName}
                      </h3>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="text-right">
                        <p 
                          className="text-sm font-primary mb-1"
                          style={{ color: selectedTemplateData.colors.text }}
                        >
                          تاريخ الإكمال
                        </p>
                        <p 
                          className="font-semibold font-display"
                          style={{ color: selectedTemplateData.colors.primary }}
                        >
                          {completionDate}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className="w-4 h-4 fill-current"
                                style={{ color: selectedTemplateData.colors.accent }}
                              />
                            ))}
                          </div>
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: selectedTemplateData.colors.primary,
                              color: 'white'
                            }}
                          >
                            {grade}
                          </Badge>
                        </div>
                        <p 
                          className="text-xs font-primary"
                          style={{ color: selectedTemplateData.colors.text }}
                        >
                          {studyHours} ساعة دراسية
                        </p>
                      </div>
                      
                      <div className="text-left">
                        <p 
                          className="text-sm font-primary mb-1"
                          style={{ color: selectedTemplateData.colors.text }}
                        >
                          المدرب
                        </p>
                        <p 
                          className="font-semibold font-display"
                          style={{ color: selectedTemplateData.colors.primary }}
                        >
                          {instructorName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Certificate ID */}
                    <div className="absolute bottom-4 left-4">
                      <p 
                        className="text-xs font-primary opacity-70"
                        style={{ color: selectedTemplateData.colors.text }}
                      >
                        رقم الشهادة: {certificateId}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Certificate Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 font-primary">الطالب</p>
                  <p className="font-semibold font-display">{studentName}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 font-primary">الدورة</p>
                  <p className="font-semibold font-display">{courseName}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 font-primary">تاريخ الإكمال</p>
                  <p className="font-semibold font-display">{completionDate}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleGenerate('pdf')}
              disabled={isGenerating}
              className="flex-1 min-w-[200px]"
            >
              <Download className="w-4 h-4 ml-2" />
              {isGenerating ? 'جاري الإنشاء...' : 'تحميل PDF'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => handleGenerate('png')}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 ml-2" />
              PNG
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => handleGenerate('jpg')}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 ml-2" />
              JPG
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
            
            <Button variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 font-display mb-2">
                  شارك إنجازك
                </h3>
                <p className="text-neutral-600 font-primary">
                  شارك شهادتك مع الأصدقاء والزملاء
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {socialPlatforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    onClick={() => handleShare(platform.id)}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", platform.color)}>
                      <platform.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-primary">{platform.name}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={copyShareLink}
                  className="w-full flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  نسخ رابط الشهادة
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  إرسال بالبريد الإلكتروني
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4"
              >
                إغلاق
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}