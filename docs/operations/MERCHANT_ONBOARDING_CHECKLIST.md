# PaySurity Merchant Onboarding Checklist

This document outlines the standard operating procedures for onboarding a new merchant to the PaySurity platform. Follow these steps sequentially to ensure a smooth and complete setup.

---

## 1. Account Creation

[] Initiate account creation via the PaySurity Admin API.
    *   **Endpoint:** `POST /api/v1/admin/merchants`
    *   **Required Payload:**
        *   `merchantName`
        *   `contactEmail`
        *   `contactPhone`
        *   `businessAddress`
        *   `primaryContactPerson`
        *   `onboardingManagerId` (ID of the PaySurity employee managing this onboarding)
    *   **Expected Output:** `merchantId` (UUID) and initial `api_key` for the tenant. Store these securely.
[] Verify merchant account status in the Admin Dashboard.

## 2. Tenant Configuration Setup

[] Access the newly created tenant's configuration via the Admin Dashboard or configuration API.
[] **Loyalty Program Setup:**
    *   Configure default loyalty rates based on the merchant's tier or agreed-upon terms.
        *   *Note: Loyalty rates are always sourced from tenant config; never hardcoded.*
    *   Set up redemption rules and points accumulation logic.
[] **Tax Rate Configuration:**
    *   Define applicable sales tax rates (e.g., state, local) for the merchant's operational regions.
    *   Configure tax exemptions if necessary.
[] **Payment Processor Integration:**
    *   Input payment gateway credentials (e.g., Stripe, Adyen, Braintree API keys, secret keys, webhooks).
    *   Select preferred payment methods (credit card, debit, mobile payments, etc.).
    *   Configure settlement accounts and frequency.
[] **Other General Settings:**
    *   Set timezone and currency.
    *   Configure notification preferences (email, SMS).
    *   Upload merchant logo and branding assets.

## 3. Seed Menu/Inventory Data

[] Work with the merchant to obtain their product catalog or service menu.
[] Import initial menu/inventory data using the PaySurity Data Import Tool or API.
    *   **Endpoint:** `POST /api/v1/merchants/{merchantId}/products/batch`
    *   **Required Data Fields:**
        *   `productName`
        *   `description`
        *   `price`
        *   `category`
        *   `SKU`
        *   `imageUrl` (optional)
        *   `taxable` (boolean)
[] Verify successful data import by browsing products in the merchant's admin dashboard.

## 4. Test Payment (Sandbox Environment)

[] Switch the merchant's environment to 'Sandbox' for testing purposes.
[] Conduct a series of test transactions using various payment methods:
    *   [] Successful credit card payment.
    *   [] Failed credit card payment (e.g., insufficient funds, invalid card).
    *   [] Refund a transaction.
    *   [] Process a loyalty points redemption.
    *   [] Process a gift card payment (if applicable).
[] Verify transaction records and balances in the Sandbox Admin Dashboard.
[] Confirm webhook notifications are correctly received by the merchant's systems (if integrated).
[] Switch the merchant's environment to 'Production' once sandbox testing is complete and verified.

## 5. DNS Microsite Setup

[] Coordinate with the merchant's IT team to configure DNS records for their PaySurity microsite.
    *   **Required:** CNAME record pointing `order.merchantdomain.com` (or similar subdomain) to `[YOUR_PAYSURITY_MICROSITE_CNAME]`.
[] Verify DNS propagation using a DNS lookup tool.
[] Test access to the merchant's new PaySurity microsite URL.
[] Confirm branding, menu, and pricing are correctly displayed on the microsite.

## 6. Merchant Training

[] Schedule and conduct training sessions with the merchant's staff.
[] Provide access to the PaySurity Merchant Admin Dashboard:
    *   **Link:** `https://admin.paysurity.com/merchants/{merchantId}/dashboard`
[] Cover key functionalities during training:
    *   [] Overview of the dashboard interface.
    *   [] Managing orders and transactions.
    *   [] Updating menu/inventory items.
    *   [] Running reports and analytics.
    *   [] Managing customer loyalty.
    *   [] Accessing support resources.
[] Share links to PaySurity's self-service documentation and video tutorials.
[] Confirm merchant staff can successfully log in and navigate the dashboard.

---

**Onboarding Complete!**
