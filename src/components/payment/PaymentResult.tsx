// src/components/payment/PaymentResult.tsx - Payment Result with Celebrations
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/api/courses";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Share2,
  Play,
  RefreshCw,
  ArrowRight,
  Gift,
  Star,
  Trophy,
  Sparkles,
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Mail,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentResultProps {
  type: 'success' | 'failure' | 'pending';
  course: Course;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  error?: string;
  onRetry?: () => void;
  onGoToCourse?: () => void;
  onDownloadReceipt?: () => void;
}

// Confetti component
const Confetti = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: '-10px'
          }}
          initial={{ y: -10, rotate: 0 }}
          animate={{ 
            y: window.innerHeight + 10, 
            rotate: 360,
            x: Math.random() * 200 - 100
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            ease: "easeOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

export function PaymentResult({
  type,
  course,
  paymentId,
  transactionId,
  amount,
  currency = 'EGP',
  error,
  onRetry,
  onGoToCourse,
  onDownloadReceipt
}: PaymentResultProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (type === 'success') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [type]);

  const formatAmount = () => {
    if (!amount) return '';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleShare = (platform: string) => {
    const shareText = `🎉 لقد أكملت دورة "${course.title}" بنجاح! انضم إلي في رحلة التعلم.`;
    const shareUrl = `${window.location.origin}/courses/${course.id}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareModal(false);
  };

  if (type === 'success') {
    return (
      <>
        {showConfetti && <Confetti />}
        
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                >
                  <CheckCircle className="w-12 h-12" />
                </motion.div>
                
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold font-display mb-2"
                >
                  🎉 تم الدفع بنجاح!
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-lg font-primary"
                >
                  مرحباً بك في رحلة التعلم الجديدة
                </motion.p>

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-4 right-4"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
                <motion.div
                  className="absolute bottom-4 left-4"
                  animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Trophy className="w-6 h-6 text-yellow-300" />
                </motion.div>
              </div>

              <CardContent className="p-8 space-y-6">
                {/* Course Info */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
                      }}
                    />
                  </div>
                  <h2 className="text-xl font-bold font-display mb-2">{course.title}</h2>
                  <p className="text-neutral-600 font-primary">
                    بواسطة {course.professor.name}
                  </p>
                </motion.div>

                {/* Payment Details */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-neutral-50 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-primary">المبلغ المدفوع:</span>
                    <span className="font-bold text-green-600 font-display">{formatAmount()}</span>
                  </div>
                  {transactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600 font-primary">رقم العملية:</span>
                      <span className="font-mono text-sm">{transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-primary">تاريخ الدفع:</span>
                    <span className="font-primary">{new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </motion.div>

                {/* What's Next */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-blue-800 font-display mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    ما ستحصل عليه الآن:
                  </h3>
                  <div className="space-y-2">
                    {[
                      'وصول فوري لجميع دروس الدورة',
                      'مواد تعليمية قابلة للتحميل',
                      'شهادة إتمام معتمدة',
                      'دعم فني مباشر'
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center gap-2 text-blue-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-primary">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Button 
                    onClick={onGoToCourse}
                    className="flex-1 h-12 text-lg font-semibold"
                    size="lg"
                  >
                    <Play className="w-5 h-5 ml-2" />
                    ابدأ التعلم الآن
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={onDownloadReceipt}
                    className="h-12"
                  >
                    <Download className="w-5 h-5 ml-2" />
                    تحميل الإيصال
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowShareModal(true)}
                    className="h-12"
                  >
                    <Share2 className="w-5 h-5 ml-2" />
                    مشاركة
                  </Button>
                </motion.div>

                {/* Motivational Message */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <Star className="w-5 h-5 text-yellow-500" />
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <p className="text-neutral-700 font-primary">
                    "كل خطوة في التعلم هي استثمار في مستقبلك. أحسنت الاختيار!"
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
                    أخبر أصدقاءك عن رحلتك التعليمية الجديدة
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
                    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
                    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
                    { id: 'copy', name: 'نسخ الرابط', icon: Copy, color: 'bg-neutral-600' }
                  ].map((platform) => (
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

                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-green-600 text-sm font-primary mb-4"
                  >
                    ✓ تم نسخ الرابط بنجاح
                  </motion.div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setShowShareModal(false)}
                  className="w-full"
                >
                  إغلاق
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (type === 'failure') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <XCircle className="w-12 h-12" />
              </motion.div>
              
              <h1 className="text-3xl font-bold font-display mb-2">
                فشل في عملية الدفع
              </h1>
              <p className="text-white/90 text-lg font-primary">
                لم نتمكن من إتمام عملية الدفع
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Error Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 font-display mb-1">
                      سبب الفشل:
                    </h3>
                    <p className="text-red-700 font-primary">
                      {error || 'حدث خطأ غير متوقع أثناء معالجة عملية الدفع'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg opacity-75">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold font-display mb-2">{course.title}</h2>
                <p className="text-neutral-600 font-primary">
                  بواسطة {course.professor.name}
                </p>
              </div>

              {/* What to do next */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 font-display mb-3">
                  ماذا يمكنك فعله الآن:
                </h3>
                <div className="space-y-2">
                  {[
                    'تحقق من بيانات البطاقة وحاول مرة أخرى',
                    'تأكد من وجود رصيد كافي في البطاقة',
                    'جرب طريقة دفع أخرى',
                    'تواصل مع البنك إذا استمرت المشكلة'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-primary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={onRetry}
                  className="flex-1 h-12 text-lg font-semibold"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 ml-2" />
                  حاول مرة أخرى
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="h-12"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  العودة للدورة
                </Button>
              </div>

              {/* Support */}
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-neutral-600 font-primary mb-2">
                  تحتاج مساعدة؟ فريق الدعم جاهز لمساعدتك
                </p>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  تواصل مع الدعم
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Pending state
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-8 text-white text-center">
            <motion.div
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-12 h-12" />
            </motion.div>
            
            <h1 className="text-3xl font-bold font-display mb-2">
              جاري معالجة الدفع
            </h1>
            <p className="text-white/90 text-lg font-primary">
              يرجى الانتظار بينما نتحقق من عملية الدفع
            </p>
          </div>

          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-neutral-600 font-primary">
                لا تغلق هذه الصفحة حتى اكتمال العملية
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}