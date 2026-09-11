


export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum OrderTypeEnum {
  DINE_IN = 'dine-in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery',
  ONLINE = 'online', // For orders placed online, not necessarily for pickup (could be for delivery too)
}

export enum PaymentMethodTypeEnum {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  GIFT_CARD = 'gift_card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  OTHER = 'other',
}
