# PaySurity Platform Architecture Overview

PaySurity is a robust, multi-tenant SaaS payment platform designed to provide secure, scalable, and flexible payment processing solutions across diverse business verticals. Acting as an umbrella platform, PaySurity consolidates various payment services and applications under a unified architecture, ensuring seamless operation, stringent security, and efficient resource utilization for all its tenants.

## Verticals

PaySurity supports a wide array of payment processing needs through specialized verticals, each tailored to specific industry requirements:

*   **BistroBeast**: A point-of-sale (POS) system specifically engineered for restaurants and food service establishments. It handles order management, table service, kitchen display systems, and integrated payment processing.
*   **GrocerEase**: A comprehensive POS solution for grocery stores, supermarkets, and convenience stores. It supports inventory management, barcode scanning, loyalty programs, and efficient checkout flows.
*   **PaySurity Payroll**: A dedicated module for payroll processing, including salary disbursements, tax calculations, compliance reporting, and direct deposits for employees across various companies.
*   **Digital Wallets**: Integrations with popular digital wallet providers such as Apple Pay, Google Pay, and Samsung Pay, enabling modern, contactless payment options for merchants and consumers.
*   **eCom**: An online payment gateway and processing service for e-commerce websites and applications, supporting various payment methods, fraud detection, and subscription billing.
*   **Affiliates**: A platform for managing affiliate programs, tracking referrals, calculating commissions, and facilitating timely payouts to affiliate partners.

## How Tenant Isolation Works

Tenant isolation is a fundamental principle of PaySurity's multi-tenant architecture, ensuring that each tenant's data remains completely separate and secure from others.

1.  **`tenantId` on Every Request**: Every API request processed by the PaySurity platform *must* include a `tenantId`. This `tenantId` is extracted from the authenticated user's context, specifically as `tenantId = req?.user?.tenantId`.
2.  **Database Segregation**: All tenant-scoped data is logically separated within a shared PostgreSQL database instance.
    *   Every tenant-scoped table includes a `tenant_id` column.
    *   Primary keys (PKs) utilize `gen_random_uuid()` for generating universally unique identifiers.
    *   **All database queries *must* explicitly filter by `tenant_id`**. For example, when fetching transactions, the query would always include `WHERE tenant_id = :tenantId`.
    *   Database interactions leverage raw `sql`` template literals` to ensure explicit control over query construction and the mandatory inclusion of the `tenant_id` filter.
3.  **Application-Level Enforcement**: The application layer strictly enforces `tenantId` checks on all data access patterns, preventing cross-tenant data leakage. Services are designed to operate within the context of a single tenant for any given request.

## Payment Flow

The payment flow within PaySurity is designed for reliability, flexibility, and security:

1.  **Merchant Initiation**: A payment transaction is initiated by a merchant through one of the PaySurity verticals (e.g., customer swipe at BistroBeast POS, online checkout via eCom).
2.  **Payment Router**: The request is routed to the central `PaymentRouter` service within PaySurity. This service acts as an intelligent orchestrator.
3.  **Gateway Selection**: The `PaymentRouter` dynamically selects the most appropriate external payment gateway (e.g., FluidPay, Stripe, or a specialized local gateway) based on various factors:
    *   Tenant-specific configurations (e.g., preferred gateway, failover options).
    *   Payment method (credit card, digital wallet, ACH).
    *   Transaction currency and geographic region.
    *   Load balancing and performance metrics.
4.  **Secure Transmission**: The `PaymentRouter` securely transmits the tokenized or encrypted payment details to the chosen external payment gateway. It handles API authentication, data formatting, and error handling with the gateway.
5.  **Gateway Processing**: The external gateway processes the payment (authorization, capture, refund).
6.  **Status Update & Notification**: The gateway returns the transaction status to the `PaymentRouter`. The `PaymentRouter` updates the transaction record in PaySurity's internal database (ensuring `tenantId` is part of the update query) and notifies the originating merchant application of the outcome.
7.  **Idempotency & Retries**: The `PaymentRouter` implements idempotency keys to prevent duplicate transactions and handles intelligent retries for transient gateway errors.
8.  **Webhooks**: PaySurity leverages webhooks from payment gateways to receive asynchronous updates on transaction statuses (e.g., settlement, disputes), further ensuring data consistency.

## Event Bus

PaySurity utilizes an event-driven architecture to achieve loose coupling between services, enhance scalability, and enable real-time reactive processing.

*   **Implementation**: The platform uses NestJS EventEmitter2 as its internal event bus mechanism.
*   **Mechanism**: Services emit discrete events (e.g., `payment.succeeded`, `transaction.failed`, `user.created`, `loyalty.points.awarded`) when significant state changes occur. Other services, acting as listeners, subscribe to these events and react accordingly without direct dependencies on the emitting service.
*   **Benefits**:
    *   **Decoupling**: Services operate independently, reducing complexity and facilitating easier maintenance and evolution.
    *   **Scalability**: Asynchronous processing allows the system to handle spikes in load more gracefully.
    *   **Real-time Processing**: Enables immediate reactions to business events, such as updating loyalty points upon a successful payment or sending notifications.
    *   **Extensibility**: New features or integrations can be added by simply listening to existing events without modifying core services.

## Security Model

PaySurity's security model is built on multiple layers to protect sensitive payment data and ensure platform integrity and compliance.

*   **Authentication & Authorization**:
    *   **HMAC Guard**: For secure service-to-service communication and external API integrations, PaySurity employs an HMAC (Hash-based Message Authentication Code) guard. This ensures that requests are legitimate, unaltered, and originate from authorized sources.
    *   **Role-Based Access Control (RBAC)**: Within each tenant's environment, user access is governed by RBAC, restricting actions and data visibility based on assigned roles and permissions.
*   **PAN Redaction**:
    *   PaySurity strictly adheres to PCI DSS compliance standards. Primary Account Numbers (PANs) are **never stored in plaintext** within PaySurity's databases.
    *   Sensitive payment card data is either immediately tokenized by external gateways or encrypted at rest, with only the last four digits of the card number stored for display and reconciliation purposes.
    *   Redaction is applied at all data entry points and during data retrieval to ensure only authorized, masked information is ever exposed.
*   **Audit Logging**:
    *   A comprehensive audit trail is maintained for all critical actions and data modifications across the platform.
    *   The `AuditLogService` is utilized for recording these events via `this.auditLogService.record(tenantId, {userId, action, details})`.
    *   Each audit log entry captures the `tenantId`, `userId` (if applicable), the specific `action` performed (e.g., `TRANSACTION_CREATED`, `USER_LOGIN`, `TENANT_CONFIG_UPDATED`), and `details` providing context, such as old/new values, relevant identifiers, and timestamps. This ensures full traceability and supports compliance requirements.
*   **Loyalty Rates from Tenant Configuration**:
    *   To prevent hardcoding and ensure tenant-specific customization and security, loyalty rates and other tenant-specific business rules are **always retrieved from the tenant's configuration data**. This is done via a dedicated tenant config query, ensuring that no sensitive business logic or rates are ever hardcoded in the application layer.
