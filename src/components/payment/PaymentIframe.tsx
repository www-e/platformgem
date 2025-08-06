// src/components/payment/PaymentIframe.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentInitiationResponse } from "@/lib/api/payments";
import { 
  Shield, 
  ExternalLink, 
  CreditCard, 
  Smartphone,
  Loader2,
  AlertCircle
} from "lucide-react";

type PaymentMethod = 'credit-card' | 'e-wallet';

interface PaymentIframeProps {
  paymentData: PaymentInitiationResponse;
  paymentMethod: PaymentMethod;
  onComplete: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentIframe({ 
  paymentData, 
  paymentMethod, 
  onComplete, 
  onError 
}: PaymentIframeProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    // Listen for payment completion messages
    const messageHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes('paymob.com')) {
        return;
      }
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'payment_success') {
          console.log('Payment success message received:', data);
          onComplete(paymentData.paymentId);
        } else if (data.type === 'payment_error') {
          console.log('Payment error message received:', data);
          onError('فشل في إتمام عملية الدفع');
        }
      } catch (error) {
        console.error('Error parsing payment message:', error);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Set timeout for iframe loading
    const timeout = setTimeout(() => {
      if (!iframeLoaded && !iframeError) {
        console.warn('PayMob iframe taking longer than expected to load');
        setShowFallback(true);
      }
    }, 15000); // 15 seconds timeout
    
    return () => {
      window.removeEventListener('message', messageHandler);
      clearTimeout(timeout);
    };
  }, [paymentData.paymentId, iframeLoaded, iframeError, onComplete, onError]);

  const handleIframeLoad = () => {
    console.log('PayMob iframe loaded successfully');
    setIframeLoaded(true);
    setShowFallback(false);
  };

  const handleIframeError = () => {
    console.error('PayMob iframe failed to load');
    setIframeError(true);
    setShowFallback(true);
  };

  const retryIframe = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
  };

  const openInNewTab = () => {
    window.open(paymentData.iframeUrl, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paymentMethod === 'credit-card' ? (
              <CreditCard className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
            {paymentMethod === 'credit-card' ? 'دفع بالبطاقة الائتمانية' : 'دفع بالمحفظة الإلكترونية'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">
                {paymentMethod === 'credit-card' 
                  ? 'أدخل بيانات بطاقتك الائتمانية في النموذج أدناه'
                  : 'اختر محفظتك الإلكترونية وأدخل رقم هاتفك'
                }
              </p>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-white relative" style={{ minHeight: '700px', height: '700px' }}>
              {showFallback ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">تأخر في تحميل نموذج الدفع</h3>
                  <p className="text-muted-foreground mb-4">
                    يمكنك فتح نموذج الدفع في نافذة جديدة للمتابعة
                  </p>
                  <Button onClick={openInNewTab} className="mb-2">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    فتح في نافذة جديدة
                  </Button>
                  <Button variant="outline" onClick={retryIframe}>
                    إعادة المحاولة
                  </Button>
                </div>
              ) : (
                <>
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">جاري تحميل نموذج الدفع...</p>
                      <p className="text-xs text-muted-foreground">قد يستغرق هذا بضع ثوانٍ</p>
                    </div>
                  )}
                  
                  <iframe
                    key={paymentData.iframeUrl} // Force re-render when URL changes
                    src={paymentData.iframeUrl}
                    width="100%"
                    height="700"
                    style={{ 
                      border: 'none', 
                      borderRadius: '8px', 
                      minHeight: '700px',
                      display: iframeLoaded ? 'block' : 'none'
                    }}
                    allowTransparency={true}
                    allowFullScreen={true}
                    allow="payment"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                <Shield className="w-4 h-4" />
                <span>هذا النموذج محمي ومشفر بواسطة PayMob</span>
              </div>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  فتح في نافذة جديدة
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>رقم العملية: {paymentData.paymentId}</p>
            <p>المبلغ: {paymentData.amount} {paymentData.currency}</p>
            <p>الطريقة: {paymentMethod === 'credit-card' ? 'بطاقة ائتمانية' : 'محفظة إلكترونية'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}