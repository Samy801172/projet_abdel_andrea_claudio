// src/model/Payment/enums/payment.enums.ts
export enum PaymentMethodEnum {
  PAYPAL = 'PayPal',
  BANCONTACT = 'Bancontact',
  CREDIT_CARD = 'Credit Card',
  BANK_TRANSFER = 'Bank Transfer'
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}