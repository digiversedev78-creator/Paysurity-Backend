## Glossary (canonical definitions; abbreviations expanded)
- **Super Admin:** PaySurity owner-level platform administrator (you and any other PaySurity owners you designate) with full platform access and controls.
- **Sub Super Admin:** PaySurity internal staff role designated by a Super Admin. Permissions are configurable and may be scoped by module, merchant, location, and action.
- **Merchant:** A business that accepts payments for goods/services and holds a merchant processing relationship (merchant account) through an acquirer/processor/gateway.
- **Merchant Admin:** The primary administrator within a Merchant boundary (typically the business owner) who can configure merchant settings, locations, users, permissions, products, and workflows within that Merchant boundary.
- **Sub Merchant Admin:** A merchant-created administrator account with configurable delegated permissions inside the Merchant boundary.
- **Location:** An operational subdivision inside a Merchant boundary (store/site/branch). Location settings include device defaults, tax locality, user scopes, and POS configuration.
- **RBAC:** Role-Based Access Control: authorization model mapping roles to permissions; combined with data-scope rules to restrict what each user can see/do.
- **NAICS:** North American Industry Classification System code used to classify businesses by industry (used for default POS module recommendation).
- **SIC:** Standard Industrial Classification code used to classify businesses by industry (used for default POS module recommendation).
- **POS:** Point of Sale system (PaySurity POS Retail module).
- **POSR:** Point of Sale Restaurant module (restaurant operations management).
- **POSG:** Point of Sale Grocery module (grocery operations management).
- **KDS:** Kitchen Display System (screen-based order/ticket queue for kitchen staff).
- **Tenant (Deferred):** A future Phase 2+ top-level enterprise container above Merchant. Not used in Phase 1.


### Abbreviations (expanded)

- **ACH:** Automated Clearing House (bank-to-bank electronic funds transfer network in the U.S.).
- **AML:** Anti-Money Laundering (controls and processes to detect/prevent money laundering).
- **BSA:** Bank Secrecy Act (U.S. AML law requiring certain financial compliance programs and reporting).
- **FinCEN:** Financial Crimes Enforcement Network (U.S. Treasury bureau administering BSA/AML reporting).
- **KDS:** Kitchen Display System (screen-based ticket/order queue used by kitchen staff).
- **KYB:** Know Your Business (business identity verification and due diligence).
- **KYC:** Know Your Customer (identity verification and due diligence for individuals).
- **MSB:** Money Services Business (FinCEN regulatory category; may apply depending on wallet program model and activities).
- **NACHA:** National Automated Clearing House Association (governing body and rule-set steward for ACH).
- **NAICS:** North American Industry Classification System (industry classification code used to recommend default POS module).
- **PCI DSS:** Payment Card Industry Data Security Standard (card data security standard; scope depends on card data handling model).
- **PII:** Personally Identifiable Information (data that can identify a person).
- **RBAC:** Role-Based Access Control (authorization model mapping roles to permissions; combined with data-scope rules).
- **SAR:** Suspicious Activity Report (BSA/AML report filed via FinCEN BSA E-Filing when required).
- **SIC:** Standard Industrial Classification (industry classification code used to recommend default POS module).
- **SOC 2:** Service Organization Control 2 (audit framework for security/availability/confidentiality/privacy controls).
- **W-2:** Wage and Tax Statement (U.S. employee year-end form).
- **1099-NEC:** Nonemployee Compensation (U.S. contractor year-end form).
- **ORC:** Payment Orchestration (PaySurity module that abstracts gateway/provider integrations behind a single API).
- **WAL:** Digital Wallets (PaySurity module for stored-value ledger + controls + P2P rules).
- **POS:** Point of Sale (PaySurity retail point-of-sale module).
- **POSR:** Point of Sale Restaurant (PaySurity restaurant POS module).
- **POSG:** Point of Sale Grocery (PaySurity grocery POS module).


- **Go-live:** The moment a Merchant transitions from onboarding/configuration to production operations; see Go-live triggers in ONB/ADM (first production transaction OR admin-set go_live_at OR validated Activate action).
- **Affiliate (Affiliate Marketer):** Third-party promoter who refers or sells PaySurity services using tracked links.
- **Reseller (Reseller Partner):** Partner that sells PaySurity solutions, typically with its own microsite and onboarding workflows.
- **Referral (Referral):** Customer-to-customer referral mechanism (distinct from Affiliate (Affiliate Marketer) and Reseller (Reseller Partner)).

- **FluidPay:** A payment gateway/provider supported by PaySurity via ORC adapters. Provider capabilities (tokenization, vault, recurring, webhooks, fee programs, webshop plugins, checkout wallets) are reused where they satisfy requirements; PaySurity WAL stored-value ledger is separate.
