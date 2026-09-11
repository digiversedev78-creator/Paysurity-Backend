```yaml
title: PaySurity Tenant Microsite System Canonical Requirements
version: 1.0.0
date: 2023-10-27
author: PaySurity Product Team
```

# PaySurity Tenant Microsite System Canonical Requirements

## 1. Introduction

This document outlines the canonical requirements for the PaySurity Tenant Microsite System. The purpose of this system is to provide PaySurity tenants (e.g., restaurants, cafes) with an easily provisioned, customizable, and mobile-optimized online presence for displaying their menu, accepting orders, and engaging with customers. The system aims to integrate seamlessly with the existing PaySurity Point-of-Sale (POS) system and provide robust management capabilities for both tenants and PaySurity super administrators.

## 2. Glossary

*   **Microsite:** A dedicated, tenant-specific website hosted and managed by PaySurity, used for displaying menus and accepting online orders.
*   **Tenant:** A business (e.g., restaurant) that uses PaySurity's services, including the POS and Microsite system.
*   **POS:** Point-of-Sale system. PaySurity's core application for managing sales, inventory, and operations.
*   **Super Admin:** A PaySurity administrator with global privileges to manage tenants, system settings, and overrides.
*   **Tenant Admin:** An authorized user from a tenant business who manages their specific microsite and POS settings.
*   **CRUD:** Create, Read, Update, Delete - fundamental operations for data management.
*   **CNAME:** Canonical Name record; a type of DNS record that maps an alias name to a true or canonical domain name.
*   **Schema.org:** A collaborative, community activity with a mission to create, maintain, and promote schemas for structured data on the Internet, on web pages, in email messages, and beyond.
*   **Core Web Vitals:** Google's metrics for evaluating user experience, including Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS).

## 3. Core Principles

*   **Tenant Empowerment:** Provide tenants with intuitive tools to manage their online presence.
*   **Seamless Integration:** Ensure tight coupling and real-time synchronization between the Microsite and PaySurity POS.
*   **Scalability & Performance:** Design for high availability, rapid provisioning, and optimal user experience.
*   **Security & Compliance:** Implement industry best practices for data protection and privacy.
*   **Mobile-First Design:** Prioritize mobile user experience for all microsites.

## 4. Detailed Requirements

---

### MST-001: Tenant microsite auto-provisioning on tenant signup

*   **ID:** MST-001
*   **Title:** Tenant Microsite Auto-Provisioning
*   **Description:** Upon successful signup and onboarding of a new tenant within the PaySurity ecosystem, a dedicated microsite for that tenant must be automatically provisioned and configured with default settings.
*   **Functional Requirements:**
    *   The system shall automatically trigger the creation of a new microsite instance when a new tenant record is finalized.
    *   The microsite shall be assigned a default URL (e.g., `[tenantname].paysurity.com`).
    *   The microsite shall be pre-populated with a default template and initial configuration (e.g., placeholder menu, operating hours).
    *   The tenant admin credentials shall be automatically linked to the newly provisioned microsite.
*   **Non-Functional Requirements:**
    *   **Performance:** Microsite provisioning must complete within 60 seconds of tenant signup finalization.
    *   **Reliability:** The auto-provisioning process must have a success rate of 99.9%.
*   **Dependencies:**
    *   PaySurity Tenant Onboarding System.
    *   Microsite Hosting Infrastructure.
*   **Acceptance Criteria:**
    *   A new tenant completes signup and their dedicated microsite is immediately accessible at its default URL.
    *   The new tenant can log into their Tenant Admin Panel for the newly created microsite.
    *   The microsite displays a default landing page or menu.
*   **Stakeholders:** PaySurity Operations, Tenant Onboarding Team, Product Management, Tenants.

---

### MST-002: Custom domain mapping (CNAME) per tenant

*   **ID:** MST-002
*   **Title:** Custom Domain Mapping
*   **Description:** Each tenant must have the ability to map their own custom domain name (e.g., `myrestaurant.com`) to their PaySurity microsite, replacing the default `[tenantname].paysurity.com` URL.
*   **Functional Requirements:**
    *   The Tenant Admin Panel shall provide an interface for tenants to input and save their desired custom domain.
    *   The system shall provide instructions to the tenant for configuring a CNAME record with their domain registrar.
    *   The system shall validate the existence and correct configuration of the CNAME record before activating the custom domain.
    *   Upon successful CNAME validation, the microsite shall be accessible via the custom domain.
    *   The system shall automatically provision and manage SSL/TLS certificates for custom domains.
*   **Non-Functional Requirements:**
    *   **Security:** All custom domains must be served over HTTPS with valid SSL/TLS certificates.
    *   **Performance:** DNS resolution for custom domains should be optimized for low latency.
*   **Dependencies:**
    *   DNS management system.
    *   SSL/TLS certificate provisioning service (e.g., Let's Encrypt integration).
*   **Acceptance Criteria:**
    *   A tenant enters `www.example.com` in their admin panel, configures the CNAME, and `www.example.com` displays their PaySurity microsite.
    *   The microsite loaded via the custom domain uses HTTPS.
    *   If the CNAME is incorrectly configured, the system provides a clear error message.
*   **Stakeholders:** Tenants, PaySurity Technical Support, Product Management.

---

### MST-003: Menu management CRUD (categories, items, prices, images)

*   **ID:** MST-003
*   **Title:** Comprehensive Menu Management
*   **Description:** Tenants must have a user-friendly interface within their Tenant Admin Panel to perform full CRUD operations on their menu, including categories, individual items, their prices, and associated images.
*   **Functional Requirements:**
    *   The Tenant Admin Panel shall provide a dedicated section for menu management.
    *   Tenants shall be able to create, edit, and delete menu categories.
    *   Tenants shall be able to create, edit, and delete individual menu items, including:
        *   Item name and description.
        *   Base price.
        *   Category assignment.
        *   Image upload and management (crop, resize).
        *   Availability (e.g., active/inactive).
        *   Dietary tags (e.g., vegetarian, gluten-free).
        *   Customization options (e.g., toppings, spice levels).
    *   Changes made in the admin panel shall be immediately reflected on the live microsite.
*   **Non-Functional Requirements:**
    *   **Usability:** The menu management interface must be intuitive and easy for non-technical users.
    *   **Scalability:** The system must handle menus with hundreds of items and multiple categories efficiently.
*   **Dependencies:**
    *   Image storage service.
    *   Database for menu data.
*   **Acceptance Criteria:**
    *   A tenant can log in, add a new menu item with a price and image, and see it instantly appear on their microsite.
    *   A tenant can reorder categories and items within categories.
    *   A tenant can update an item's price, and the change is reflected on the microsite and in the price calculation engine.
*   **Stakeholders:** Tenants, Product Management, PaySurity Design Team.

---

### MST-004: Price calculation engine: displayPrice = base × (1 + processingFee) × (1 + marginPct)

*   **ID:** MST-004
*   **Title:** Dynamic Price Calculation Engine
*   **Description:** The microsite must incorporate a price calculation engine that dynamically determines the final display price for each menu item based on its base price, a configurable processing fee, and PaySurity's margin percentage.
*   **Functional Requirements:**
    *   The system shall calculate `displayPrice` for each menu item using the formula: `displayPrice = base_price * (1 + processingFee) * (1 + marginPct)`.
    *   `base_price` shall be configured by the tenant via MST-003.
    *   `processingFee` shall be a system-wide or tenant-specific configurable percentage (MST-006).
    *   `marginPct` shall be a system-wide configurable percentage (MST-005).
    *   The calculated `displayPrice` shall be shown to customers on the microsite.
*   **Non-Functional Requirements:**
    *   **Accuracy:** Price calculations must be precise, adhering to standard financial rounding rules.
    *   **Performance:** Price calculation must not introduce noticeable latency during menu display or cart updates.
*   **Dependencies:**
    *   MST-003 (Base Price), MST-005 (Margin), MST-006 (Processing Fee).
*   **Acceptance Criteria:**
    *   Given a `base_price` of $100, `processingFee` of 5%, and `marginPct` of 20%, the `displayPrice` shown on the microsite is $126.00.
    *   Changes to `processingFee` or `marginPct` immediately reflect in all `displayPrices` on the microsite.
*   **Stakeholders:** Product Management, Finance Team, Tenants.

---

### MST-005: PaySurity margin configurable by super admin (default 20%)

*   **ID:** MST-005
*   **Title:** Super Admin Configurable PaySurity Margin
*   **Description:** PaySurity super administrators must be able to globally configure the `marginPct` component of the price calculation engine, with a default value of 20%.
*   **Functional Requirements:**
    *   The Super Admin Panel shall provide a dedicated interface to set the global `marginPct`.
    *   The default `marginPct` shall be 20% if no custom value is set.
    *   Changes made by a super admin shall immediately affect the `displayPrice` calculation across all tenants.
*   **Non-Functional Requirements:**
    *   **Security:** Only authenticated and authorized super admins can modify this setting.
    *   **Auditability:** All changes to `marginPct` must be logged.
*   **Dependencies:**
    *   MST-004 (Price Calculation Engine).
*   **Acceptance Criteria:**
    *   A super admin logs in, navigates to the margin settings, and changes the margin from 20% to 25%. All tenant microsites immediately update their displayed prices according to the new margin.
    *   The system defaults to 20% margin if no configuration is present.
*   **Stakeholders:** PaySurity Management, Finance Team, Product Management.

---

### MST-006: Processing fee configurable (default 5%)

*   **ID:** MST-006
*   **Title:** Configurable Processing Fee
*   **Description:** The `processingFee` component, used in the price calculation engine, must be configurable. This fee can be set globally by super admins or, in future phases, potentially per-tenant, with a default value of 5%.
*   **Functional Requirements:**
    *   The Super Admin Panel shall provide an interface to set the global `processingFee`.
    *   The default `processingFee` shall be 5% if no custom value is set.
    *   Changes made by an admin shall immediately affect the `displayPrice` calculation across all tenants (or specific tenants if per-tenant configuration is implemented).
*   **Non-Functional Requirements:**
    *   **Security:** Only authenticated and authorized super admins can modify this setting.
    *   **Auditability:** All changes to `processingFee` must be logged.
*   **Dependencies:**
    *   MST-004 (Price Calculation Engine).
*   **Acceptance Criteria:**
    *   A super admin changes the global processing fee from 5% to 3%. All tenant microsites immediately update their displayed prices according to the new fee.
    *   The system defaults to 5% processing fee if no configuration is present.
*   **Stakeholders:** PaySurity Management, Finance Team, Product Management.

---

### MST-007: POS ↔ Microsite bidirectional sync (menu changes reflect on both)

*   **ID:** MST-007
*   **Title:** Bidirectional Menu Synchronization
*   **Description:** Menu data (categories, items, prices, availability) must be synchronized bidirectionally between the PaySurity POS system and the tenant's microsite, ensuring consistency regardless of where the change originates.
*   **Functional Requirements:**
    *   Changes to menu items (add, edit, delete) made in the PaySurity POS system shall be pushed to the corresponding tenant microsite in near real-time.
    *   Changes to menu items (add, edit, delete) made in the Tenant Admin Panel shall be pushed to the corresponding PaySurity POS system in near real-time.
    *   The synchronization process shall handle concurrent updates and conflict resolution (e.g., last write wins, or defined priority).
    *   Availability toggles (e.g., item out of stock) in the POS shall update microsite availability.
*   **Non-Functional Requirements:**
    *   **Latency:** Menu synchronization should occur within 10 seconds.
    *   **Reliability:** Synchronization must have a success rate of 99.9%.
    *   **Data Integrity:** Ensure no data loss or corruption during sync.
*   **Dependencies:**
    *   PaySurity POS System API (for menu data).
    *   MST-003 (Microsite Menu Management).
*   **Acceptance Criteria:**
    *   A tenant updates the price of "Coffee" in their POS. Within seconds, the microsite displays the updated price for "Coffee".
    *   A tenant marks "Chocolate Cake" as out of stock in their Tenant Admin Panel. Within seconds, the POS reflects "Chocolate Cake" as unavailable.
    *   No menu discrepancies are observed between POS and microsite after typical usage.
*   **Stakeholders:** Tenants, PaySurity POS Team, Product Management.

---

### MST-008: Catering orders with advance notice enforcement (minimum 48h)

*   **ID:** MST-008
*   **Title:** Catering Order Management with Advance Notice
*   **Description:** The microsite must support catering orders, requiring customers to place such orders with a minimum of 48 hours advance notice from the desired delivery/pickup time.
*   **Functional Requirements:**
    *   The ordering flow shall allow customers to designate an order as "Catering" (if enabled for the tenant).
    *   For catering orders, a date and time picker shall be presented.
    *   The date/time picker shall enforce a minimum 48-hour lead time from the current time. Customers cannot select a time within this window.
    *   The system shall clearly communicate the advance notice requirement to the customer.
    *   Catering orders shall be distinctly marked in the POS and Tenant Admin Panel.
*   **Non-Functional Requirements:**
    *   **Usability:** Clear messaging and intuitive date picker for catering orders.
*   **Dependencies:**
    *   MST-014 (Order Flow).
*   **Acceptance Criteria:**
    *   A customer attempts to place a catering order for tomorrow morning. The system prevents selection and indicates the 48-hour minimum.
    *   A customer successfully places a catering order for 3 days from now.
    *   The catering order appears in the Tenant Admin Panel and POS with the correct type and scheduled time.
*   **Stakeholders:** Tenants, Customers, Product Management.

---

### MST-009: Special event orders (Paan 50+) with advance notice and prepayment

*   **ID:** MST-009
*   **Title:** Special Event Order Handling with Prepayment and Advance Notice
*   **Description:** For specific menu items designated as "special event" items (e.g., Paan orders exceeding a certain quantity like 50 units), the system must enforce distinct advance notice requirements (e.g., 24 hours) and mandate full prepayment at the time of order placement.
*   **Functional Requirements:**
    *   Tenants shall be able to mark specific menu items as "special event" items and configure quantity thresholds for these rules (e.g., Paan > 50).
    *   For orders containing "special event" items exceeding their threshold:
        *   The system shall enforce a specific advance notice period (e.g., minimum 24 hours, configurable per item or globally). This notice is separate from or additive to catering notice.
        *   The checkout process shall mandate full prepayment; cash on delivery or partial payment options will be disabled.
        *   The system shall clearly communicate these special requirements to the customer.
    *   Special event orders shall be distinctly marked in the POS and Tenant Admin Panel.
*   **Non-Functional Requirements:**
    *   **Flexibility:** Configurable rules for special event items.
*   **Dependencies:**
    *   MST-014 (Order Flow), Payment Gateway Integration.
    *   MST-003 (Menu Item Configuration).
*   **Acceptance Criteria:**
    *   A customer adds 60 Paan units to their cart. The system automatically enforces a 24-hour advance notice window and requires online prepayment at checkout.
    *   A customer attempts to order 60 Paan units for delivery in 12 hours. The system prevents this and explains the 24-hour minimum.
    *   The tenant can configure "Gulab Jamun" to require a 48-hour notice for quantities over 100.
*   **Stakeholders:** Tenants, Customers, Product Management, Finance Team.

---

### MST-010: Tenant Admin Panel for CRUD operations

*   **ID:** MST-010
*   **Title:** Tenant-Specific Administration Panel
*   **Description:** Each tenant must be provided with a secure, dedicated web-based administration panel allowing them to manage their microsite's content, settings, and orders.
*   **Functional Requirements:**
    *   The Tenant Admin Panel shall require secure authentication and authorization.
    *   Tenants shall be able to perform CRUD operations on their menu items, categories, and customization options (MST-003).
    *   Tenants shall be able to configure microsite-specific settings, including:
        *   Operating hours and special closures.
        *   Contact information and address.
        *   Custom domain mapping (MST-002).
        *   SEO settings (MST-012).
    *   Tenants shall be able to view incoming orders and their status (MST-015).
    *   The panel shall display analytics and reports relevant to their microsite performance (future scope, but layout considerations for now).
*   **Non-Functional Requirements:**
    *   **Security:** Role-based access control, secure login, data encryption.
    *   **Usability:** Intuitive UI/UX, responsive design for various devices.
    *   **Performance:** Fast loading times for dashboard and configuration pages.
*   **Dependencies:**
    *   Authentication and Authorization System.
    *   Database for tenant-specific settings.
*   **Acceptance Criteria:**
    *   A tenant logs into their admin panel and can successfully update their business hours.
    *   The tenant cannot access or modify settings or data belonging to other tenants.
    *   The admin panel is accessible and fully functional on a tablet device.
*   **Stakeholders:** Tenants, PaySurity Design Team, Product Management.

---

### MST-011: Super admin override of per-tenant settings

*   **ID:** MST-011
*   **Title:** Super Admin Tenant Setting Override
*   **Description:** PaySurity super administrators must have the capability to access, view, and override any tenant-specific setting or data point, including menu items, pricing, operating hours, and general configuration. This is crucial for support, troubleshooting, and global policy enforcement.
*   **Functional Requirements:**
    *   The Super Admin Panel shall include a tenant management section.
    *   Super admins shall be able to select any tenant and view all their configurable settings and data (e.g., menu, orders, domain settings).
    *   Super admins shall be able to modify and save changes to any tenant's settings or data.
    *   All changes made by a super admin to tenant data shall be logged with an audit trail, indicating the super admin, tenant, setting changed, old value, and new value.
*   **Non-Functional Requirements:**
    *   **Security:** Strict role-based access to the override functionality, only for Super Admins.
    *   **Auditability:** Comprehensive logging for all changes.
    *   **Data Integrity:** Ensure overrides do not corrupt tenant data.
*   **Dependencies:**
    *   Super Admin Panel.
    *   Audit logging system.
*   **Acceptance Criteria:**
    *   A super admin logs in, selects Tenant A, and successfully changes an item price on Tenant A's menu. Tenant A's microsite reflects this change.
    *   The audit log shows the super admin's action, the specific change made, and the timestamp.
    *   A super admin can temporarily disable a tenant's microsite.
*   **Stakeholders:** PaySurity Operations, Technical Support, Product Management.

---

### MST-012: SEO: per-tenant meta tags, structured data (Restaurant schema.org)

*   **ID:** MST-012
*   **Title:** SEO Optimization with Per-Tenant Meta Tags and Structured Data
*   **Description:** Each tenant's microsite must be optimized for search engines, allowing tenants to configure specific meta tags and automatically generating structured data using the Schema.org `Restaurant` type for improved search visibility.
*   **Functional Requirements:**
    *   The Tenant Admin Panel shall provide dedicated fields for tenants to input:
        *   Meta Title (for the homepage and potentially other key pages).
        *   Meta Description.
        *   Keywords (optional, for historical/internal tracking).
    *   The system shall automatically generate and embed JSON-LD structured data (using `https://schema.org/Restaurant`) into each microsite's HTML.
    *   The generated `Restaurant` schema shall include essential details such as:
        *   Restaurant Name.
        *   Address.
        *   Phone number.
        *   Operating hours.
        *   Menu items (using `https://schema.org/MenuItem` and `https://schema.org/Menu`).
        *   (Future) Ratings/Reviews, Price Range.
    *   The system shall ensure that URLs are clean and SEO-friendly (e.g., `mysite.com/menu/category-name/item-name`).
*   **Non-Functional Requirements:**
    *   **Accessibility:** Ensure generated markup doesn't hinder screen readers.
    *   **Maintainability:** Schema generation should be flexible to updates in Schema.org standards.
*   **Dependencies:**
    *   MST-003 (Menu Data), MST-010 (Tenant Admin Panel).
*   **Acceptance Criteria:**
    *   A tenant configures a meta description in their admin panel. Inspecting the microsite's source code shows the correct meta description tag.
    *   Using Google's Rich Results Test tool, the microsite's homepage successfully validates `Restaurant` structured data, correctly populating details like name, address, and menu items.
    *   Changing a restaurant's address in the admin panel updates the `Restaurant` schema accordingly.
*   **Stakeholders:** Tenants, Marketing Team, Product Management.

---

### MST-013: Mobile-optimized responsive design (Core Web Vitals)

*   **ID:** MST-013
*   **Title:** Mobile-Optimized Responsive Design with Core Web Vitals Adherence
*   **Description:** All tenant microsites must be designed and developed with a mobile-first approach, ensuring a fully responsive and intuitive user experience across all devices (mobile, tablet, desktop) and optimizing performance to meet or exceed Google's Core Web Vitals thresholds.
*   **Functional Requirements:**
    *   The microsite's layout and content shall adapt gracefully to various screen sizes and orientations.
    *   Interactive elements (buttons, forms) shall be easily usable on touch devices.
    *   Images and media shall be optimized for quick loading and display on mobile.
*   **Non-Functional Requirements:**
    *   **Usability:** Consistent user experience across devices.
    *   **Performance:**
        *   **Largest Contentful Paint (LCP):** Under 2.5 seconds for 75% of users.
        *   **First Input Delay (FID):** Under 100 milliseconds for 75% of users.
        *   **Cumulative Layout Shift (CLS):** Under 0.1 for 75% of users.
    *   **Compatibility:** Support for modern web browsers (Chrome, Firefox, Safari, Edge).
*   **Dependencies:**
    *   None specific, relies on UI/UX and Frontend Development best practices.
*   **Acceptance Criteria:**
    *   The microsite renders without horizontal scrolling on common mobile devices (e.g., iPhone, Android).
    *   Google Lighthouse audit for the microsite's homepage shows "Good" for all Core Web Vitals metrics.
    *   A user can easily navigate the menu, add items to the cart, and checkout on a smartphone.
*   **Stakeholders:** Customers, Tenants, PaySurity Design Team, Product Management.

---

### MST-014: Order flow: menu → cart → checkout → confirmation

*   **ID:** MST-014
*   **Title:** Standardized Customer Order Flow
*   **Description:** The microsite must provide a clear, intuitive, and streamlined order placement process for customers, guiding them from menu browsing through cart management, checkout, and order confirmation.
*   **Functional Requirements:**
    *   **Menu Browsing:** Customers shall be able to view menu categories and items with details (name, description, calculated `displayPrice`, image).
    *   **Add to Cart:** Customers shall be able to add single or multiple items to a shopping cart. Item customization options (if applicable) must be selectable before adding to cart.
    *   **Cart Management:** Customers shall be able to view their cart contents, update quantities, and remove items before proceeding to checkout. The cart shall display a subtotal, estimated tax, and total.
    *   **Checkout Process:**
        *   Customer information input (name, contact, delivery/pickup details).
        *   Selection of order type (delivery/pickup, standard/catering/special event).
        *   Payment method selection (online payment, cash on delivery if allowed).
        *   Secure integration with payment gateways for online payments.
        *   Address validation for delivery orders.
    *   **Order Confirmation:** Upon successful order placement, the customer shall receive an immediate on-screen confirmation with an order ID and summary. An order confirmation email shall also be sent.
*   **Non-Functional Requirements:**
    *   **Usability:** Low friction, clear calls to action, minimal steps.
    *   **Security:** PCI DSS compliance for payment processing.
    *   **Performance:** Fast loading times between steps.
*   **Dependencies:**
    *   MST-004 (Price Calculation), MST-008 (Catering Orders), MST-009 (Special Event Orders).
    *   Payment Gateway API.
*   **Acceptance Criteria:**
    *   A customer can successfully add items to the cart, proceed through all checkout steps, make an online payment, and receive an order confirmation on-screen and via email.
    *   The checkout process clearly displays all costs before final payment.
    *   The system prevents checkout if mandatory fields are missing or invalid.
*   **Stakeholders:** Customers, Tenants, Product Management, PaySurity Design Team.

---

### MST-015: Real-time order sync with POS when activated

*   **ID:** MST-015
*   **Title:** Real-time Order Synchronization with POS
*   **Description:** Once an order is successfully placed and confirmed on the microsite, it must be synchronized in real-time with the respective tenant's PaySurity POS system to initiate fulfillment processes.
*   **Functional Requirements:**
    *   Upon successful completion of the MST-014 order flow, the system shall transmit the full order details to the tenant's PaySurity POS system.
    *   Order details shall include: order ID, customer information, list of items and quantities, total price, payment status, order type (delivery/pickup, catering/standard), and scheduled time.
    *   The integration shall use a robust API or webhook mechanism to ensure reliable delivery of order data.
    *   The POS system shall acknowledge receipt of the order.
    *   In case of transmission failure, the system shall implement retry logic and alert appropriate personnel.
*   **Non-Functional Requirements:**
    *   **Latency:** Orders must appear in the POS within 5 seconds of customer confirmation.
    *   **Reliability:** Order transmission must have a success rate of 99.99%.
    *   **Data Integrity:** Ensure complete and accurate order data is transferred.
*   **Dependencies:**
    *   PaySurity POS System API (for order ingestion).
    *   MST-014 (Order Flow).
*   **Acceptance Criteria:**
    *   A customer places an order on a tenant's microsite. Within seconds, the order appears on the tenant's POS screen, ready for preparation.
    *   The order details (items, quantity, total) in the POS match exactly what the customer ordered on the microsite.
    *   If the POS is temporarily offline, the microsite system retries sending the order once the POS is back online, or notifies support.
*   **Stakeholders:** Tenants, PaySurity POS Team, Product Management, Operations Team.