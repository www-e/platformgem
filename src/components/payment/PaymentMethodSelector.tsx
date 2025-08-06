// src/components/payment/PaymentMethodSelector.tsx
"use client";

import { useState } from "react";
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
  Loader2
} from "lucide-react";

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
      title: 'بطاقة ائتمان',
      description: 'ادفع باستخدام بطاقة الائتمان أو الخصم',
      icon: CreditCard,
      features: ['آمن ومشفر', 'دفع فوري', 'جميع البطاقات مقبولة'],
      popular: true
    },
    {
      id: 'e-wallet' as PaymentMethod,
      title: 'محفظة إلكترونية',
      description: 'ادفع باستخدام فودافون كاش، أورانج موني، أو إتصالات كاش',
      icon: Smartphone,
      features: ['سهل وسريع', 'بدون بطاقة', 'محافظ مصرية'],
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            اختر طريقة الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <div
                key={method.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onMethodSelect(method.id)}
              >
                {method.popular && (
                  <Badge className="absolute -top-2 right-4 bg-primary">
                    الأكثر استخداماً
                  </Badge>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{method.title}</h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {method.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-white rounded-lg border">
          <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-sm font-medium">دفع آمن</p>
          <p className="text-xs text-muted-foreground">محمي بتشفير SSL</p>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-medium">وصول فوري</p>
          <p className="text-xs text-muted-foreground">بعد إتمام الدفع</p>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <p className="text-sm font-medium">ضمان الجودة</p>
          <p className="text-xs text-muted-foreground">محتوى عالي الجودة</p>
        </div>
      </div>

      {/* Proceed Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">المبلغ الإجمالي:</span>
            <span className="text-2xl font-bold text-primary">{formatPrice()}</span>
          </div>
          
          <Button 
            onClick={onProceed}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                جاري التحضير...
              </>
            ) : (
              <>
                {selectedMethod === 'credit-card' ? (
                  <CreditCard className="w-5 h-5 mr-2" />
                ) : (
                  <Smartphone className="w-5 h-5 mr-2" />
                )}
                متابعة الدفع
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-2">
            بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </p>
        </CardContent>
      </Card>
    </div>
  );
}