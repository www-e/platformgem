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

  useEffect(() => {
    // --- E-WALLET: IMMEDIATE REDIRECT ---
    // If this is an e-wallet payment and we have the OTP URL, redirect immediately.
    if (paymentMethod === 'e-wallet' && paymentData.otpUrl) {
      console.log('E-wallet payment detected. Redirecting to PayMob for OTP:', paymentData.otpUrl);
      window.location.href = paymentData.otpUrl;
      // The component will unmount, so no further action is needed here.
      return;
    }

    // --- CREDIT CARD: IFRAME LOGIC ---
    // The rest of this effect is for credit card iframes only.
    
    // Listen for payment completion messages from the iframe
    const messageHandler = (event: MessageEvent) => {
      // Security check: ensure the message is from a trusted PayMob domain
      if (!event.origin.includes('accept.paymob.com')) {
        return;
      }
      
      // The 'transaction_processed' callback is a common pattern for iframe communication
      if (event.data?.message === 'transaction_processed') {
        const success = event.data?.success;
        if (success) {
          console.log('Payment success message received from iframe.');
          onComplete(paymentData.paymentId);
        } else {
          console.error('Payment failure message received from iframe.');
          onError('فشل في إتمام عملية الدفع عبر النموذج.');
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Set a timeout to show a fallback option if the iframe is slow to load
    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        console.warn('PayMob iframe loading timeout reached. Showing fallback.');
        setShowFallback(true);
      }
    }, 15000); // 15-second timeout
    
    return () => {
      window.removeEventListener('message', messageHandler);
      clearTimeout(timeout);
    };
  }, [paymentData, paymentMethod, onComplete, onError, iframeLoaded]);

  // --- RENDER LOGIC ---

  // For e-wallets, show a "Redirecting..." message while the browser processes the redirect.
  if (paymentMethod === 'e-wallet') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            الدفع بالمحفظة الإلكترونية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">جاري توجيهك إلى صفحة الدفع الآمنة</h3>
          <p className="text-muted-foreground">
            ستحتاج إلى إدخال رمز OTP لتأكيد الدفع.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // For credit cards, render the iframe.
  if (paymentMethod === 'credit-card' && paymentData.iframeUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            الدفع بالبطاقة الائتمانية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-white relative" style={{ height: '700px' }}>
            {!iframeLoaded && !showFallback && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">جاري تحميل نموذج الدفع الآمن...</p>
              </div>
            )}
            
            {showFallback && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8 text-center z-20">
                <AlertCircle className="w-12 h-12 text-yellow-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">هل تواجه مشكلة في تحميل النموذج؟</h3>
                <p className="text-muted-foreground mb-4">
                  يمكنك فتح صفحة الدفع في نافذة جديدة لإتمام العملية.
                </p>
                <Button onClick={() => window.open(paymentData.iframeUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4 ml-2" />
                  فتح في نافذة جديدة
                </Button>
              </div>
            )}

            <iframe
              src={paymentData.iframeUrl}
              width="100%"
              height="100%"
              style={{ border: 'none', visibility: iframeLoaded ? 'visible' : 'hidden' }}
              onLoad={() => setIframeLoaded(true)}
              onError={() => setShowFallback(true)}
              allow="payment"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mt-4">
            <Shield className="w-4 h-4" />
            <span>هذا النموذج محمي ومشفر بواسطة PayMob</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback error case if something goes wrong (e.g., no iframeUrl for credit card)
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">خطأ في عرض طريقة الدفع</h3>
        <p className="text-muted-foreground">
          لم نتمكن من تحميل واجهة الدفع. يرجى المحاولة مرة أخرى.
        </p>
      </CardContent>
    </Card>
  );
}