// src/lib/paymob/types.ts

export interface PayMobConfig {
    apiKey: string;
    integrationIdOnlineCard: string;
    integrationIdMobileWallet: string;
    iframeId: string;
    hmacSecret: string;
    baseUrl: string;
    webhookUrl: string;
    returnUrl: string;
  }
  
  export interface PayMobBillingData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    country: string;
    state: string;
    city: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
  }
  
  export interface PayMobOrderItem {
    name: string;
    amount_cents: number;
    description: string;
    quantity: number;
  }
  
  export interface PayMobOrderRequest {
    amount_cents: number;
    currency: string;
    merchant_order_id: string;
    items: PayMobOrderItem[];
    billing_data: PayMobBillingData;
  }
  
  export interface PayMobAuthResponse {
    token: string;
  }
  
  export interface PayMobOrderResponse {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: {
      id: number;
      created_at: string;
      phones: string[];
      company_emails: string[];
      company_name: string;
      state: string;
      country: string;
      city: string;
      postal_code: string;
      street: string;
    };
    collector: any;
    amount_cents: number;
    shipping_data: any;
    currency: string;
    is_payment_locked: boolean;
    is_return: boolean;
    is_cancel: boolean;
    is_returned: boolean;
    is_canceled: boolean;
    merchant_order_id: string;
    wallet_notification: any;
    paid_amount_cents: number;
    notify_user_with_email: boolean;
    items: Array<{
      name: string;
      description: string;
      amount_cents: number;
      quantity: number;
    }>;
    order_url: string;
    commission_fees: number;
    delivery_fees_cents: number;
    delivery_vat_cents: number;
    payment_method: string;
    merchant_staff_tag: any;
    api_source: string;
    data: any;
  }
  
  export interface PayMobPaymentKeyResponse {
    token: string;
  }
  
  export interface PayMobTransactionResponse {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: {
      id: number;
      merchant_order_id: string;
      amount_cents: number;
      [key: string]: any;
    };
    created_at: string;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      tenure: any;
      sub_type: string;
    };
    error_occured: boolean;
    is_live: boolean;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    updated_at: string;
    is_settled: boolean;
    bill_balanced: boolean;
    is_bill: boolean;
    owner: number;
    parent_transaction: any;
    [key: string]: any; // For other potential fields
  }