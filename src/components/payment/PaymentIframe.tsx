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
    console.log('PaymentIframe mounted with data:', {
      paymentId: paymentData.paymentId,
      iframeUrl: paymentData.iframeUrl,
      checkoutUrl: paymentData.checkoutUrl,
      paymentMethod
    });

    // For e-wallets, redirect immediately to external checkout
    if (paymentMethod === 'e-wallet' && paymentData.checkoutUrl) {
      console.log('E-wallet detected, redirecting to external checkout:', paymentData.checkoutUrl);
      // Redirect to external UnifiedCheckout (no iframe needed for e-wallets)
      window.location.href = paymentData.checkoutUrl;
      return;
    }

    // Listen for payment completion messages (credit cards only)
    const messageHandler = (event: MessageEvent) => {
      console.log('Message received from iframe:', {
        origin: event.origin,
        data: event.data
      });

      // Verify origin for security
      if (!event.origin.includes('paymob.com') && !event.origin.includes('accept.paymob.com')) {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
      }
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'payment_success' || data.success === true) {
          console.log('Payment success message received:', data);
          onComplete(paymentData.paymentId);
        } else if (data.type === 'payment_error' || data.error === true) {
          console.log('Payment error message received:', data);
          onError('فشل في إتمام عملية الدفع');
        }
      } catch (error) {
        console.error('Error parsing payment message:', error);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    const timeout = setTimeout(() => {
      if (!iframeLoaded && !iframeError && paymentMethod === 'credit-card') {
        console.warn('PayMob iframe loading timeout reached');
        setShowFallback(true);
      }
    }, 10000);
    
    return () => {
      window.removeEventListener('message', messageHandler);
      clearTimeout(timeout);
    };
  }, [paymentData.paymentId, paymentData.iframeUrl, paymentData.checkoutUrl, iframeLoaded, iframeError, onComplete, onError, paymentMethod]);

  const handleIframeLoad = () => {
    console.log('✅ PayMob iframe loaded successfully');
    setIframeLoaded(true);
    setShowFallback(false);
  };

  const handleIframeError = (error: any) => {
    console.error('❌ PayMob iframe failed to load:', error);
    setIframeError(true);
    setShowFallback(true);
  };

  const retryIframe = () => {
    console.log('🔄 Retrying iframe load...');
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
  };

  const openInNewTab = () => {
    console.log('🔗 Opening PayMob in new tab:', paymentData.iframeUrl);
    window.open(paymentData.iframeUrl, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
  };

  // Handle e-wallet payments (external redirect)
  if (paymentMethod === 'e-wallet') {
    if (!paymentData.checkoutUrl) {
      console.error('❌ Missing checkout URL for e-wallet payment');
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">خطأ في إعداد المحفظة الإلكترونية</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم إنشاء رابط الدفع للمحفظة الإلكترونية بشكل صحيح
            </p>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Show redirect message for e-wallets
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            دفع بالمحفظة الإلكترونية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">جاري التوجيه للدفع</h3>
              <p className="text-muted-foreground mb-4">
                سيتم توجيهك إلى صفحة الدفع الآمنة لإتمام عملية الدفع بالمحفظة الإلكترونية
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                اختر محفظتك الإلكترونية (فودافون كاش، أورانج موني، إتصالات كاش) وأدخل رقم هاتفك
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = paymentData.checkoutUrl!}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                متابعة الدفع
              </Button>
              
              <p className="text-xs text-muted-foreground">
                إذا لم يتم التوجيه تلقائياً، اضغط على الزر أعلاه
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">معلومات مهمة</span>
              </div>
              <ul className="text-xs text-blue-600 space-y-1 text-right">
                <li>• تأكد من وجود رصيد كافي في محفظتك</li>
                <li>• ستحتاج إلى رقم الهاتف المسجل بالمحفظة</li>
                <li>• ستصلك رسالة تأكيد على هاتفك</li>
                <li>• العملية آمنة ومحمية بالكامل</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validate iframe URL for credit cards
  if (!paymentData.iframeUrl) {
    console.error('❌ Missing iframe URL in payment data');
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">خطأ في إعداد الدفع</h3>
          <p className="text-muted-foreground mb-4">
            لم يتم إنشاء رابط نموذج الدفع بشكل صحيح
          </p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

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
                  <div className="space-x-2 space-x-reverse">
                    <Button onClick={openInNewTab} className="mb-2">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      فتح في نافذة جديدة
                    </Button>
                    <Button variant="outline" onClick={retryIframe}>
                      إعادة المحاولة
                    </Button>
                  </div>
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
                    key={`iframe-${paymentData.paymentId}`}
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
                    sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
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
            <p className="text-green-600">✅ تم إنشاء رابط الدفع بنجاح</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
