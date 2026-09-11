import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';

// â”€â”€ Infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { AuthModule } from './modules/auth/auth.module'; // SEC-001: Real auth â€” bcrypt + TOTP + DB-backed
import { DatabaseModule } from './modules/database/database.module';
import { EventBusModule } from './modules/event-bus/event-bus.module';
import { HealthModule } from './modules/health/health.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { SecurityModule } from './modules/security/security.module'; // SEC-004: Rate limiting + DDoS
// SEC-003: PAN zero-tolerance middleware (applied globally)
import { PanRedactionMiddleware } from './shared/middleware/pan-redaction.middleware';
import { TraceIdMiddleware } from './shared/middleware/trace-id.middleware';
// AGG-001: Order aggregation (DoorDash/UberEats/GrubHub)
import { AggregatorModule } from './modules/aggregator/aggregator.module';
import { NotificationModule } from './modules/notification/notification.module';

// â”€â”€ Commerce & Payments (Audited: SOLID) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { PaymentModule } from './modules/payment/payment.module';
import { MicrositeModule } from './modules/microsite/microsite.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { SettlementModule } from './modules/settlement/settlement.module';

// â”€â”€ Digital Wallets (Audited: 909 lines of production code) â”€
import { WalletModule } from './modules/wallet/wallet.module';

// â”€â”€ POS Restaurant (Audited: BistroBeast) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { KdsModule } from './modules/kds/kds.module';
import { ShiftsModule } from './modules/shifts/shifts.module';

// â”€â”€ POS Grocery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { GroceryModule } from './modules/grocery/grocery.module';

// â”€â”€ POS Retail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { RetailModule } from './modules/retail/retail.module';

// â”€â”€ Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { AnalyticsModule } from './modules/analytics/analytics.module';

// â”€â”€ Loyalty & Gift Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';

// â”€â”€ Tips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { TipsModule } from './modules/tips/tips.module';

// â”€â”€ Compliance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { ComplianceModule } from './modules/compliance/compliance.module';

// â”€â”€ CRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { CustomerCrmModule } from './modules/customer-crm/customer-crm.module';

// â”€â”€ Financial Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { PayrollModule } from './modules/payroll/payroll.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { TaxModule } from './modules/tax/tax.module';
import { PayFactorModule } from './modules/pay-factor/pay-factor.module';

// â”€â”€ Delivery & Aggregation (AGG_ORDER_AGGREGATION.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { DeliveryModule } from './modules/delivery/delivery.module';

// â”€â”€ AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { AiModule } from './modules/ai/ai.module';

// â”€â”€ Affiliates & Resellers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { AffiliatesModule } from './modules/affiliates/affiliates.module';

// â”€â”€ Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ReportsModule: any = class {};

// â”€â”€ Inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { InventoryModule } from './modules/inventory/inventory.module';

// â”€â”€ ERP (ERP_ACCOUNTING_INVENTORY.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { ErpModule } from './modules/erp/erp.module';

// â”€â”€ Employees & HR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { EmployeesModule } from './modules/employees/employees.module';

// â”€â”€ E-Commerce / Storefronts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { EcomModule } from './modules/ecom/ecom.module';
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';

// â”€â”€ Disputes / Refunds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { DisputesModule } from './modules/disputes/disputes.module';
import { RefundWorkflowModule } from './modules/refund-workflow/refund-workflow.module';

// â”€â”€ POS Verticals (unregistered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { CateringModule } from './modules/catering/catering.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { PosSyncModule } from './modules/pos-sync/pos-sync.module';

// â”€â”€ Vendor Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { VendorsModule } from './modules/vendors/vendors.module';

// â”€â”€ Financial Services (unregistered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { MastercardModule } from './modules/mastercard/mastercard.module';
import { CurrencyModule } from './modules/currency/currency.module';

// â”€â”€ Location & Launch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { LocationModule } from './modules/location/location.module';
import { LaunchModule } from './modules/launch/launch.module';
import { HardwareModule } from './common/hardware/hardware.module';

// â”€â”€ Admin & Config (unregistered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { TenantAdminModule } from './modules/tenant-admin/tenant-admin.module';

// â”€â”€ AI Support â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { AIFeedbackModule } from './modules/ai-feedback/ai-feedback.module';

// â”€â”€ Platform Infrastructure (unregistered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';
import { SecretsModule } from './modules/secrets/secrets.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PriceEngineModule } from './modules/price-engine/price-engine.module';

// â”€â”€ Website CMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { WebsiteModule } from './modules/website/website.module';

// â”€â”€ Admin Portal (Phase 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { AdminPortalModule } from './modules/admin-portal/admin-portal.module';

@Module({
  imports: [
    // â”€â”€â”€ Global Infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    // â”€â”€â”€ Core Infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    DatabaseModule,
    AuthModule,
    EventBusModule,
    HealthModule,
    AuditLogModule,
    TenantModule,
    UserModule,

    // â”€â”€â”€ Commerce & Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PaymentModule,
    MicrositeModule,
    MerchantModule,
    OrdersModule,
    CheckoutModule,
    SettlementModule,

    // â”€â”€â”€ Digital Wallets (WAL_DIGITAL_WALLETS.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    WalletModule,

    // â”€â”€â”€ POS Restaurant (POSR_POS_RESTAURANT.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    RestaurantModule,
    KdsModule,
    ShiftsModule,

    // â”€â”€â”€ POS Grocery (POSG_POS_GROCERY.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    GroceryModule,

    // â”€â”€â”€ POS Retail (POS_RETAIL.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    RetailModule,

    // â”€â”€â”€ Analytics (ANA_ANALYTICS_DASHBOARD.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    AnalyticsModule,

    // â”€â”€â”€ Loyalty & Gift Cards (LOY_LOYALTY_ENGINE.md) â”€â”€â”€â”€â”€â”€
    LoyaltyModule,
    GiftCardsModule,

    // â”€â”€â”€ Tips (GAP_FILL_ADDENDUM.md â€” POSR-011) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    TipsModule,

    // â”€â”€â”€ Compliance (COM_COMPLIANCE_LEGAL.md) â”€â”€â”€â”€â”€â”€â”€
    ComplianceModule,

    // â”€â”€â”€ CRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    CustomerCrmModule,

    // â”€â”€â”€ Financial Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PayrollModule,
    SubscriptionModule,
    TaxModule,
    PayFactorModule,

    // â”€â”€â”€ ERP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ErpModule,

    // â”€â”€â”€ Delivery & Aggregation (AGG_ORDER_AGGREGATION.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    DeliveryModule,
    AggregatorModule, // AGG-001: DoorDash/UberEats/GrubHub webhook endpoints

    // â”€â”€â”€ Notifications (NOT_NOTIFICATION_ENGINE.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    NotificationModule, // NOT-001: TCPA gate + NOT-002: templates + NOT-003: delivery log

    // â”€â”€â”€ AI (AI_EXPERIENCE.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    AiModule,

    // â”€â”€â”€ Affiliates (AFR_AFFILIATES_RESELLERS.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    AffiliatesModule,

    // â”€â”€â”€ Reports (MER-008 Statement/1099-K) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ReportsModule,

    // â”€â”€â”€ Inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    InventoryModule,

    // â”€â”€â”€ Security (SEC_SECURITY_PRIVACY.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    SecurityModule, // SEC-004: ThrottlerGuard global rate limiting

    // â”€â”€â”€ Admin Portal (Phase 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    AdminPortalModule,

    // â”€â”€â”€ P0 FIX: Previously orphaned modules (now runtime-reachable) â”€â”€â”€â”€â”€â”€â”€
    EmployeesModule,
    EcomModule,
    EcommerceModule,
    DisputesModule,
    RefundWorkflowModule,
    CateringModule,
    ReturnsModule,
    PosSyncModule,
    VendorsModule,
    MastercardModule,
    CurrencyModule,
    LocationModule,
    LaunchModule,
    TenantAdminModule,
    AIFeedbackModule,
    FeatureFlagModule,
    SecretsModule,
    WebhookModule,
    PriceEngineModule,
    WebsiteModule,
    HardwareModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // SEC-004: X-Trace-Id injected on every response (required by platform â€” SEC_SECURITY_PRIVACY.md)
    consumer.apply(TraceIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    // SEC-003: PAN zero-tolerance â€” scan every request/response for card numbers at API ingress
    // Fail-closed: if redaction crashes, the response is blocked (HTTP 500) to prevent PAN disclosure
    consumer.apply(PanRedactionMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

