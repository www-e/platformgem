// src/components/payment/PaymentForm.tsx - Secure Payment Form with Advanced Validation
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  onSubmit: (formData: PaymentFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface CardType {
  name: string;
  pattern: RegExp;
  gaps: number[];
  lengths: number[];
  code: { name: string; size: number };
  icon: string;
}

const CARD_TYPES: CardType[] = [
  {
    name: 'visa',
    pattern: /^4/,
    gaps: [4, 8, 12],
    lengths: [16, 18, 19],
    code: { name: 'CVV', size: 3 },
    icon: '💳'
  },
  {
    name: 'mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    gaps: [4, 8, 12],
    lengths: [16],
    code: { name: 'CVC', size: 3 },
    icon: '💳'
  },
  {
    name: 'amex',
    pattern: /^3[47]/,
    gaps: [4, 10],
    lengths: [15],
    code: { name: 'CID', size: 4 },
    icon: '💳'
  }
];

export function PaymentForm({ onSubmit, isLoading = false, error }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'EG'
    }
  });

  const [validation, setValidation] = useState<Record<string, string>>({});
  const [cardType, setCardType] = useState<CardType | null>(null);
  const [showCvvInfo, setShowCvvInfo] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(false);

  const cardNumberRef = useRef<HTMLInputElement>(null);

  // Detect card type
  useEffect(() => {
    const number = formData.cardNumber.replace(/\s/g, '');
    const detectedType = CARD_TYPES.find(type => type.pattern.test(number));
    setCardType(detectedType || null);
  }, [formData.cardNumber]);

  // Check if connection is secure
  useEffect(() => {
    setIsSecure(window.location.protocol === 'https:');
  }, []);

  const formatCardNumber = (value: string) => {
    const number = value.replace(/\s/g, '');
    const type = CARD_TYPES.find(t => t.pattern.test(number));
    
    if (!type) return number;
    
    let formatted = '';
    let index = 0;
    
    for (let i = 0; i < number.length; i++) {
      if (type.gaps.includes(i)) {
        formatted += ' ';
      }
      formatted += number[i];
    }
    
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'cardNumber':
        const number = value.replace(/\s/g, '');
        if (!number) return 'رقم البطاقة مطلوب';
        if (number.length < 13) return 'رقم البطاقة قصير جداً';
        if (!cardType) return 'نوع البطاقة غير مدعوم';
        if (!cardType.lengths.includes(number.length)) return 'رقم البطاقة غير صحيح';
        return '';

      case 'expiryDate':
        if (!value) return 'تاريخ الانتهاء مطلوب';
        const [month, year] = value.split('/');
        if (!month || !year) return 'تنسيق التاريخ غير صحيح';
        const monthNum = parseInt(month);
        const yearNum = parseInt('20' + year);
        if (monthNum < 1 || monthNum > 12) return 'الشهر غير صحيح';
        const now = new Date();
        const expiry = new Date(yearNum, monthNum - 1);
        if (expiry < now) return 'البطاقة منتهية الصلاحية';
        return '';

      case 'cvv':
        if (!value) return 'رمز الأمان مطلوب';
        const expectedLength = cardType?.code.size || 3;
        if (value.length !== expectedLength) return `رمز الأمان يجب أن يكون ${expectedLength} أرقام`;
        return '';

      case 'cardholderName':
        if (!value.trim()) return 'اسم حامل البطاقة مطلوب';
        if (value.trim().length < 2) return 'الاسم قصير جداً';
        return '';

      case 'email':
        if (!value) return 'البريد الإلكتروني مطلوب';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'البريد الإلكتروني غير صحيح';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    let formattedValue = value;

    // Apply formatting
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, cardType?.code.size || 4);
    }

    // Update form data
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PaymentFormData] as any,
          [child]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }

    // Validate field
    const error = validateField(name, formattedValue);
    setValidation(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'billingAddress') {
        const error = validateField(key, formData[key as keyof PaymentFormData] as string);
        if (error) errors[key] = error;
      }
    });

    setValidation(errors);

    if (Object.keys(errors).length === 0) {
      onSubmit(formData);
    }
  };

  const getFieldStatus = (fieldName: string) => {
    const hasError = validation[fieldName];
    const hasValue = formData[fieldName as keyof PaymentFormData];
    const isFocused = focusedField === fieldName;

    if (hasError) return 'error';
    if (hasValue && !hasError) return 'success';
    if (isFocused) return 'focus';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 font-display">
                {isSecure ? 'اتصال آمن ومشفر' : 'تحذير: الاتصال غير آمن'}
              </p>
              <p className="text-sm text-green-600 font-primary">
                {isSecure 
                  ? 'جميع بياناتك محمية بتشفير SSL 256-bit' 
                  : 'يرجى التأكد من استخدام اتصال HTTPS آمن'}
              </p>
            </div>
            {isSecure && <Lock className="w-5 h-5 text-green-600" />}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <CreditCard className="w-5 h-5" />
              معلومات البطاقة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="font-primary">رقم البطاقة</Label>
              <div className="relative">
                <Input
                  ref={cardNumberRef}
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  onFocus={() => setFocusedField('cardNumber')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "pl-12 pr-16 font-mono text-lg",
                    getFieldStatus('cardNumber') === 'error' && "border-red-500 focus:border-red-500",
                    getFieldStatus('cardNumber') === 'success' && "border-green-500",
                    getFieldStatus('cardNumber') === 'focus' && "border-primary-500"
                  )}
                  maxLength={23}
                />
                
                {/* Card Type Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {cardType ? (
                    <div className="text-2xl">{cardType.icon}</div>
                  ) : (
                    <CreditCard className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                {/* Validation Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldStatus('cardNumber') === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getFieldStatus('cardNumber') === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {validation.cardNumber && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 font-primary"
                >
                  {validation.cardNumber}
                </motion.p>
              )}

              {cardType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Badge variant="secondary" className="text-xs font-primary">
                    {cardType.name.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-neutral-500 font-primary">
                    {cardType.lengths.join(' أو ')} رقم
                  </span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="font-primary">تاريخ الانتهاء</Label>
                <div className="relative">
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    onFocus={() => setFocusedField('expiryDate')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "font-mono text-center",
                      getFieldStatus('expiryDate') === 'error' && "border-red-500",
                      getFieldStatus('expiryDate') === 'success' && "border-green-500"
                    )}
                    maxLength={5}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('expiryDate') === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {getFieldStatus('expiryDate') === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {validation.expiryDate && (
                  <p className="text-sm text-red-600 font-primary">{validation.expiryDate}</p>
                )}
              </div>

              {/* CVV */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="cvv" className="font-primary">
                    {cardType?.code.name || 'CVV'}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowCvvInfo(!showCvvInfo)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="cvv"
                    type="text"
                    placeholder={cardType?.code.size === 4 ? "1234" : "123"}
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    onFocus={() => setFocusedField('cvv')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "font-mono text-center",
                      getFieldStatus('cvv') === 'error' && "border-red-500",
                      getFieldStatus('cvv') === 'success' && "border-green-500"
                    )}
                    maxLength={cardType?.code.size || 4}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('cvv') === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {getFieldStatus('cvv') === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {showCvvInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded font-primary"
                    >
                      رمز الأمان المكون من {cardType?.code.size || 3} أرقام على ظهر البطاقة
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {validation.cvv && (
                  <p className="text-sm text-red-600 font-primary">{validation.cvv}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName" className="font-primary">اسم حامل البطاقة</Label>
              <div className="relative">
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="الاسم كما هو مكتوب على البطاقة"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  onFocus={() => setFocusedField('cardholderName')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    getFieldStatus('cardholderName') === 'error' && "border-red-500",
                    getFieldStatus('cardholderName') === 'success' && "border-green-500"
                  )}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldStatus('cardholderName') === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {getFieldStatus('cardholderName') === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {validation.cardholderName && (
                <p className="text-sm text-red-600 font-primary">{validation.cardholderName}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">معلومات الاتصال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-primary">البريد الإلكتروني</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    getFieldStatus('email') === 'error' && "border-red-500",
                    getFieldStatus('email') === 'success' && "border-green-500"
                  )}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldStatus('email') === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {getFieldStatus('email') === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {validation.email && (
                <p className="text-sm text-red-600 font-primary">{validation.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-primary">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
              جاري معالجة الدفع...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 ml-2" />
              دفع آمن ومشفر
            </>
          )}
        </Button>

        {/* Security Footer */}
        <div className="text-center text-sm text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span className="font-primary">SSL محمي</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span className="font-primary">PCI DSS معتمد</span>
            </div>
          </div>
          <p className="font-primary">
            بياناتك محمية ولن يتم حفظ معلومات البطاقة على خوادمنا
          </p>
        </div>
      </form>
    </div>
  );
}