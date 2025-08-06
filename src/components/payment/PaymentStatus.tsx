// src/components/payment/PaymentStatus.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentInitiationResponse } from "@/lib/api/payments";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface PaymentStatusProps {
  type: 'processing' | 'verifying' | 'success' | 'error';
  title: string;
  message: string;
  paymentData?: PaymentInitiationResponse | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function PaymentStatus({ 
  type, 
  title, 
  message, 
  paymentData, 
  onRetry, 
  onCancel 
}: PaymentStatusProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'processing':
      case 'verifying':
        return <Loader2 className="w-16 h-16 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-600" />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
      case 'verifying':
        return 'text-primary';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h2 className={`text-2xl font-bold mb-4 ${getTextColor()}`}>
          {title}
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {message}
        </p>

        {/* Payment Information */}
        {paymentData && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
            <div className="space-y-1 text-muted-foreground">
              <p>رقم العملية: {paymentData.paymentId}</p>
              <p>المبلغ: {paymentData.amount} {paymentData.currency}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {type === 'error' && (
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} size="lg">
                <RefreshCw className="w-5 h-5 mr-2" />
                حاول مرة أخرى
              </Button>
            )}
            {onCancel && (
              <Button variant="outline" onClick={onCancel} size="lg">
                إلغاء
              </Button>
            )}
          </div>
        )}

        {/* Loading indicators */}
        {(type === 'processing' || type === 'verifying') && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>يرجى عدم إغلاق هذه الصفحة</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}