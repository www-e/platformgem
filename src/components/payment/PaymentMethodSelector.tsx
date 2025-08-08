// src/components/payment/PaymentMethodSelector.tsx - Enhanced Payment Method Selection
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/api/courses";
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  Clock, 
  CheckCircle,
  Loader2,
  Lock,
  Zap,
  Award,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethod = 'credit-card' | 'e-wallet';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodSelect: (method: PaymentMethod) => void;
  onProceed: () => void;
  isLoading: boolean;
  course: Course;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  onProceed,
  isLoading,
  course
}: PaymentMethodSelectorProps) {
  
  const formatPrice = () => {
    if (!course.price) return 'مجاني';
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: course.currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(course.price));
  };

  const paymentMethods = [
    {
      id: 'credit-card' as PaymentMethod,
      title: 'بطاقة ائتمان أو خصم',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      features: ['تشفير SSL', 'دفع فوري', 'حماية المشتري'],
      processingTime: 'فوري',
      popular: true,
      color: 'blue'
    },
    {
      id: 'e-wallet' as PaymentMethod,
      title: 'محفظة إلكترونية',
      description: 'فودافون كاش، أورانج موني، إتصالات كاش',
      icon: Smartphone,
      features: ['بدون بطاقة', 'سهل وسريع', 'محلي'],
      processingTime: 'فوري',
      popular: false,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-display">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            اختر طريقة الدفع المناسبة
          </CardTitle>
          <p className="text-neutral-600 font-primary">
            جميع طرق الدفع محمية بأعلى معايير الأمان
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <motion.div
                key={method.id}
                className={cn(
                  "relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200",
                  isSelected 
                    ? "border-primary-500 bg-primary-50 shadow-lg" 
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md"
                )}
                onClick={() => onMethodSelect(method.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {method.popular && (
                  <Badge className="absolute -top-3 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-black">
                    الأكثر استخداماً
                  </Badge>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-4 rounded-xl transition-all duration-200",
                    isSelected 
                      ? method.color === 'blue' 
                        ? "bg-blue-500 text-black" 
                        : "bg-green-500 text-black"
                      : method.color === 'blue'
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold font-display">{method.title}</h3>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-black" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className="text-neutral-600 font-primary mb-3">
                      {method.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Zap className="w-4 h-4" />
                        <span className="font-primary">{method.processingTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {method.features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs font-primary"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Security Assurance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, title: "تشفير SSL 256", desc: "حماية متقدمة", color: "green" },
          { icon: Lock, title: "PCI DSS معتمد", desc: "معايير دولية", color: "blue" },
          { icon: Clock, title: "وصول فوري", desc: "بعد الدفع مباشرة", color: "purple" },
          { icon: Award, title: "ضمان الاسترداد", desc: "30 يوم كاملة", color: "orange" }
        ].map((item, index) => (
          <motion.div
            key={index}
            className="p-4 bg-white rounded-lg border text-center hover:shadow-md transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn(
              "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center",
              item.color === "green" && "bg-green-100 text-green-600",
              item.color === "blue" && "bg-blue-100 text-blue-600",
              item.color === "purple" && "bg-purple-100 text-purple-600",
              item.color === "orange" && "bg-orange-100 text-orange-600"
            )}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold font-display mb-1">{item.title}</p>
            <p className="text-xs text-neutral-600 font-primary">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Proceed Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-neutral-50 to-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-neutral-600 font-primary mb-1">المبلغ الإجمالي</p>
              <p className="text-3xl font-bold text-primary-600 font-display">{formatPrice()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500 font-primary">شامل جميع الرسوم</p>
              <p className="text-sm text-green-600 font-primary">✓ بدون رسوم إضافية</p>
            </div>
          </div>
          
          <Button 
            onClick={onProceed}
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
                جاري التحضير...
              </>
            ) : (
              <>
                {selectedMethod === 'credit-card' ? (
                  <CreditCard className="w-5 h-5 ml-2" />
                ) : (
                  <Smartphone className="w-5 h-5 ml-2" />
                )}
                متابعة إلى الدفع الآمن
              </>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-neutral-500">
            <span className="font-primary">محمي بواسطة</span>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span className="font-primary">SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              <span className="font-primary">PCI DSS</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}