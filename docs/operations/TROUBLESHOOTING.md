# PaySurity Operations Troubleshooting Guide

This document outlines common operational issues encountered with the PaySurity platform and provides steps for diagnosis and resolution.

---

## 1. API Service Not Starting

**Issue:** The PaySurity API service fails to start, often with errors related to configuration or environment variables.

**Solution:**
Verify that all essential environment variables are correctly set and accessible to the API service.
*   **`DATABASE_URL`**: Ensure this points to the correct PostgreSQL instance and has the proper credentials (username, password, host, port, database name). A common mistake is an incorrect port or hostname.
*   **`JWT_SECRET`**: Confirm this secret key is present and is a sufficiently strong, randomly generated string. The API uses this for token signing and verification during startup.
*   **Other critical `ENV` vars**: Review `pm2 logs` or your container orchestrator logs for specific environment variable missing errors.

---

## 2. 401 Unauthorized on All API Routes

**Issue:** All API endpoints, even those expected to be accessible, return a `401 Unauthorized` status code.

**Solution:**
This almost always indicates a mismatch in the `JWT_SECRET` used for signing tokens and the one used for verifying them.
*   **Development/Testing**: If you're regenerating tokens, ensure the `JWT_SECRET` used by the API service matches the one used by your authentication service or testing client to sign the tokens.
*   **Deployment**: Verify that the `JWT_SECRET` environment variable deployed with the API service is identical to the one known to the authentication token issuance mechanism. Even a single character difference will cause verification to fail.
*   **Rotation**: If `JWT_SECRET` was recently rotated, ensure all services that rely on it (both signing and verification) have been updated and redeployed with the new secret.

---

## 3. Database Connection Refused

**Issue:** The PaySurity API or background services are unable to connect to the PostgreSQL database, resulting in "connection refused" errors.

**Solution:**
This points to a networking or authentication problem between the application and the database.
*   **Cloud SQL Proxy**: If using Google Cloud SQL, ensure the Cloud SQL Proxy is running correctly on the host where the application is deployed. Check its logs for connection errors or authentication issues. The proxy acts as a secure tunnel; if it's down or misconfigured, direct database connections will fail.
*   **Network Policy / Firewall**: Verify that the network policy or firewall rules allow inbound connections to the PostgreSQL database on its specified port (typically 5432) from the IP addresses or network ranges of your application servers or the Cloud SQL Proxy.
*   **Database Host/Port**: Double-check the `DATABASE_URL` for correct hostname and port.
*   **Credentials**: Confirm that the username and password in `DATABASE_URL` are correct and have the necessary permissions to connect to the database.

---

## 4. Build Fails (ESLint/Prettier/Import Issues)

**Issue:** The build process (e.g., `npm run build` or CI/CD pipeline) fails with errors related to banned imports, specific ESLint violations, or Prettier formatting issues that are difficult to resolve manually.

**Solution:**
PaySurity has strict coding standards and module dependencies.
*   **Run `sweep-banned-imports.js`**: Before attempting a build, especially after merging branches or updating dependencies, execute the `node scripts/sweep-banned-imports.js` script. This utility automatically identifies and often fixes common issues with disallowed imports (e.g., internal modules referenced incorrectly) or formatting that could block the build.
*   **ESLint/Prettier**: If the build still fails, manually run `npm run lint` and `npm run format` to identify remaining issues. Address any reported errors.
*   **Dependency Conflicts**: Check `package.json` for potential dependency conflicts or outdated packages that might introduce build-breaking changes.

---

## 5. Payments Failing Consistently

**Issue:** All or a significant number of payment transactions are consistently failing, either returning errors from payment gateways or not processing at all.

**Solution:**
This usually points to misconfigured credentials or API keys for the integrated payment gateways.
*   **`FLUIDPAY_API_KEY`**: Verify the `FLUIDPAY_API_KEY` environment variable is correctly set and is the active API key for your FluidPay account in the target environment (staging/production). Check FluidPay's developer dashboard for key status.
*   **`STRIPE_SECRET_KEY`**: Verify the `STRIPE_SECRET_KEY` environment variable is correctly set and is the active secret key for your Stripe account in the target environment. Check Stripe's developer dashboard for key status and API permissions.
*   **Gateway Status**: Check the status pages for FluidPay and Stripe (e.g., `status.fluidpay.com`, `status.stripe.com`) to ensure there are no ongoing service outages.
*   **Transaction Logs**: Review PaySurity's payment processing logs for specific error messages returned by the payment gateways. These messages often pinpoint the exact cause of failure (e.g., invalid card data, authentication failure, currency mismatch).

---

## 6. SMS Messages Not Sending

**Issue:** The platform is unable to send SMS notifications, despite the API calls appearing to succeed internally, or failing with a generic error.

**Solution:**
SMS delivery involves both platform credentials and compliance requirements.
*   **Twilio Credentials**: Verify the following Twilio environment variables:
    *   `TWILIO_ACCOUNT_SID`
    *   `TWILIO_AUTH_TOKEN`
    *   `TWILIO_PHONE_NUMBER` (the sender number)
    Ensure these are all correct and active for your Twilio account in the target environment.
*   **Twilio Console**: Check your Twilio console for error logs related to message sending. This can provide specific details like "permission denied," "invalid number," or "unreachable destination."
*   **TCPA Opt-In Required**: For many message types, especially promotional or non-transactional messages, the recipient *must* have explicitly opted in to receive SMS messages, in compliance with TCPA (Telephone Consumer Protection Act) regulations.
    *   **Database Check**: Query the `tenant_user_communication_preferences` table to ensure the `sms_opt_in` flag is `TRUE` for the target `tenant_id` and `user_id`.
    *   **Consent Flow**: Confirm that your application's user interface correctly captures and records SMS opt-in consent.
*   **Blocked Numbers**: Check if the recipient's number is on a blocklist or has previously opted out.

---

## 7. Loyalty Rates Missing or Incorrect

**Issue:** Loyalty programs are not applying correctly, or the calculated loyalty rates (points, discounts) are incorrect or missing altogether.

**Solution:**
Loyalty configurations are tenant-specific and stored in the database.
*   **Initial Staging Population**: If this is a new staging environment or a new tenant, it's highly likely that the `tenant_loyalty_configs` table is empty or lacks the necessary default entries.
    *   **Run `seed-all-staging.js`**: Execute `node scripts/seed-all-staging.js`. This script is designed to populate essential default configurations for staging environments, including the base loyalty rates required for initial testing. It ensures that the `tenant_loyalty_configs` table has at least a baseline set of rules for all active tenants.
*   **Tenant-Specific Configuration**: If the issue persists for a specific tenant after running the seed script, log into the PaySurity admin panel or directly query the `tenant_loyalty_configs` table for that `tenant_id`.
    *   Verify that the expected loyalty tiers, rates, and rules are present and correctly configured.
    *   Ensure there are no overlapping or conflicting rules that might lead to unexpected behavior.
*   **Code Logic**: If DB configurations appear correct, review the application logic that retrieves and applies loyalty rates to ensure it's querying the `tenant_loyalty_configs` table correctly and applying the rules as expected based on `tenantId`.
