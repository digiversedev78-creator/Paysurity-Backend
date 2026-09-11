// Canonical enums — source of truth across all services
// Values must match database enum types exactly

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  COMPLIANCE_ADMIN = 'compliance_admin',
  SUPPORT_AGENT = 'support_agent',
  MERCHANT_ADMIN = 'merchant_admin',
  MERCHANT_USER = 'merchant_user',
  AFFILIATE = 'affiliate',
  RESELLER = 'reseller',
  CASHIER = 'cashier',
  STORE_MANAGER = 'store_manager',
  SYSTEM_INTEGRATOR = 'system_integrator',
  READONLY = 'readonly',
}

export enum PaymentIntentStatus {
  CREATED = 'created',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  PROCESSING = 'processing',
  REQUIRES_CAPTURE = 'requires_capture',
  CAPTURED = 'captured',
  SUCCEEDED = 'succeeded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  DISPUTED = 'disputed',
}

export enum OrderStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  SUBMITTED = 'submitted',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum MerchantStatus {
  PROSPECT = 'prospect',
  APPLICATION_PENDING = 'application_pending',
  UNDERWRITING = 'underwriting',
  APPROVED = 'approved',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  CLOSED = 'closed',
}

export enum GatewayProvider {
  FLUIDPAY = 'fluidpay',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  NMI = 'nmi',
  AUTHORIZE_NET = 'authorize_net',
  OTHER = 'other',
}

export enum PaymentMethodType {
  CARD = 'card',
  ACH = 'ach',
  EBT = 'ebt',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  WALLET = 'wallet',
  CHECK = 'check',
  CASH = 'cash',
  GIFT_CARD = 'gift_card',
  OTHER = 'other',
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ESCALATE = 'ESCALATE',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
}
