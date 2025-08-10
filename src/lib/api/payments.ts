// src/lib/api/payments.ts
import { ApiResponse } from '@/lib/api-utils';

export interface Payment {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paymobOrderId: string | null;
  paymobTxnId: string | null;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    professor: {
      name: string;
    };
  };
  isEnrolled?: boolean;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  paymentKey?: string;
  iframeUrl?: string;
  orderId?: number;
  // E-wallet specific fields
  intentionId?: string;
  clientSecret?: string;
  checkoutUrl?: string;
  paymentMethod: 'credit-card' | 'e-wallet';
  amount: number;
  currency: string;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    professor: string;
  };
}

class PaymentsApi {
  private baseUrl = '/api/payments';

  /**
   * Initiate payment for a course
   */
  async initiatePayment(courseId: string, paymentMethod: 'credit-card' | 'e-wallet' = 'credit-card'): Promise<PaymentInitiationResponse> {
    const response = await fetch(`${this.baseUrl}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        courseId,
        paymentMethod 
      }),
    });
    
    const data: ApiResponse<PaymentInitiationResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في بدء عملية الدفع');
    }
    
    return data.data!;
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/${paymentId}/status`);
    const data: ApiResponse<Payment> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في جلب حالة الدفع');
    }
    
    return data.data!;
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${paymentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'cancel' }),
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في إلغاء عملية الدفع');
    }
  }

  /**
   * Poll payment status until completion or timeout
   */
  async pollPaymentStatus(
    paymentId: string, 
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onStatusChange?: (status: Payment['status']) => void;
    } = {}
  ): Promise<Payment> {
    const { maxAttempts = 30, intervalMs = 2000, onStatusChange } = options;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const payment = await this.getPaymentStatus(paymentId);
        
        if (onStatusChange) {
          onStatusChange(payment.status);
        }
        
        // If payment is no longer pending, return the result
        if (payment.status !== 'PENDING') {
          return payment;
        }
        
        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        console.error(`Payment status check attempt ${attempt + 1} failed:`, error);
        
        // If it's the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    throw new Error('انتهت مهلة انتظار تأكيد الدفع');
  }

  /**
   * Format payment amount for display
   */
  formatAmount(payment: Payment): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: payment.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(payment.amount);
  }

  /**
   * Get payment status display text
   */
  getStatusText(status: Payment['status']): string {
    switch (status) {
      case 'PENDING':
        return 'في الانتظار';
      case 'COMPLETED':
        return 'مكتمل';
      case 'FAILED':
        return 'فشل';
      case 'REFUNDED':
        return 'مسترد';
      default:
        return 'غير معروف';
    }
  }

  /**
   * Get payment status color for UI
   */
  getStatusColor(status: Payment['status']): string {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'REFUNDED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Create PayMob iframe for payment
   */
  createPaymentIframe(iframeUrl: string, containerId: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    }
    
    return iframe;
  }

  /**
   * Listen for payment completion messages from iframe
   */
  listenForPaymentCompletion(
    onSuccess: (data: any) => void,
    onError: (error: any) => void
  ): () => void {
    const messageHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes('paymob.com')) {
        return;
      }
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'payment_success') {
          onSuccess(data);
        } else if (data.type === 'payment_error') {
          onError(data);
        }
      } catch (error) {
        console.error('Error parsing payment message:', error);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }

  /**
   * Validate payment data before initiation
   */
  validatePaymentData(courseId: string): string[] {
    const errors: string[] = [];
    
    if (!courseId || courseId.trim().length === 0) {
      errors.push('معرف الدورة مطلوب');
    }
    
    return errors;
  }

  /**
   * Handle payment errors with user-friendly messages
   */
  handlePaymentError(error: any): string {
    if (error instanceof Error) {
      const message = error.message;
      
      // Map common error messages to Arabic
      if (message.includes('already enrolled')) {
        return 'أنت مسجل في هذه الدورة بالفعل';
      }
      if (message.includes('free course')) {
        return 'هذه الدورة مجانية ولا تحتاج لدفع';
      }
      if (message.includes('pending payment')) {
        return 'لديك عملية دفع معلقة لهذه الدورة';
      }
      if (message.includes('own course')) {
        return 'لا يمكنك شراء دورتك الخاصة';
      }
      if (message.includes('not published')) {
        return 'الدورة غير منشورة حالياً';
      }
      if (message.includes('payment gateway')) {
        return 'حدث خطأ في نظام الدفع. يرجى المحاولة مرة أخرى';
      }
      
      return message;
    }
    
    return 'حدث خطأ غير متوقع';
  }
}

export const paymentsApi = new PaymentsApi();