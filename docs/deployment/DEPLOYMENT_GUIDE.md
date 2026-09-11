# PaySurity Deployment Guide

This guide provides step-by-step instructions for deploying the PaySurity multi-tenant SaaS payment platform on Google Cloud Platform (GCP) using Cloud Run and Cloud SQL.

## 1. Prerequisites

Before starting the deployment, ensure you have the following in place:

*   **GCP Project**: A funded Google Cloud Project with billing enabled.
*   **APIs Enabled**:
    *   Cloud Run API
    *   Cloud SQL Admin API
    *   Cloud Build API
    *   Secret Manager API
    *   Artifact Registry API (if using private Docker registries)
    *   Pub/Sub API (for audit logs and events)
*   **Cloud SQL for PostgreSQL Instance**:
    *   A PostgreSQL instance (e.g., `paysurity-db-instance`) created in Cloud SQL.
    *   Ensure the instance is configured with appropriate storage, region, and network settings (e.g., Private IP for enhanced security, or Public IP with authorized networks for simpler setup).
    *   A dedicated database (e.g., `paysurity_prod`) and a service account user with appropriate permissions created within the instance.
*   **`gcloud` CLI**: Ensure you have the Google Cloud SDK installed and configured on your local machine, authenticated to the correct GCP project.

## 2. Environment Setup (.env Required Variables)

The PaySurity application relies on several environment variables for configuration. These variables should be securely managed (e.g., using Google Secret Manager or Cloud Run environment variables directly, though Secret Manager is recommended for sensitive data).

Below is a list of essential environment variables:

```ini
# Core Application Configuration
PORT=8080 # Or any desired port, Cloud Run uses 8080 by default

# Database Configuration (Cloud SQL connection string)
# Example for Cloud SQL Proxy or Private IP:
# DATABASE_URL="postgresql://[USER]:[PASSWORD]@/[DATABASE]?host=/cloudsql/[PROJECT_ID]:[REGION]:[INSTANCE_NAME]"
# Example for Public IP (not recommended for production without IP restrictions):
# DATABASE_URL="postgresql://[USER]:[PASSWORD]@[PUBLIC_IP]/[DATABASE]"
DATABASE_URL="postgresql://paysurity_user:YOUR_DB_PASSWORD@/paysurity_prod?host=/cloudsql/your-gcp-project-id:your-region:paysurity-db-instance"

# Security and Authentication
JWT_SECRET="A_STRONG_RANDOM_SECRET_FOR_JWT_SIGNING" # Use Secret Manager for this in production

# Payment Gateway Configuration (Example for Stripe)
STRIPE_SECRET_KEY="sk_live_YOUR_STRIPE_SECRET_KEY" # Use Secret Manager
STRIPE_WEBHOOK_SECRET="whsec_YOUR_STRIPE_WEBHOOK_SECRET" # Use Secret Manager

# Google Cloud Project Details
GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
GOOGLE_CLOUD_REGION="your-gcp-region" # e.g., us-central1

# Audit Logging (using Pub/Sub)
AUDIT_LOG_TOPIC_NAME="paysurity-audit-logs"

# Message Queue (if using RabbitMQ or similar)
RABBITMQ_URL="amqp://user:password@rabbitmq-host:5672" # Use Secret Manager for credentials

# Tenant Configuration Cache
TENANT_CONFIG_CACHE_TTL_SECONDS=300 # Time-to-live for tenant config cache in seconds

# Other settings (e.g., logging level)
LOG_LEVEL="info"
```

## 3. Database Migration

Database migrations must be run before deploying new application code that depends on schema changes. Seed data should also be applied as needed for initial setup or specific scenarios.

1.  **Run Migrations**:
    The PaySurity application uses a migration system (e.g., Drizzle-Kit or a custom script). To apply pending migrations:
    ```bash
    # Ensure you are in the project root or the directory containing migration scripts
    npm install # if not already done
    npm run migrate:up
    ```
    This command will connect to the `DATABASE_URL` specified in your environment and apply all pending schema changes. It is recommended to run this from a CI/CD pipeline step that has Cloud SQL Client access or from a secure bastion host with the Cloud SQL Proxy.

2.  **Run Seeds (if applicable)**:
    Seed data populates the database with initial configurations, default tenants, or test data.
    ```bash
    npm run seed
    ```
    *Caution*: Running seed scripts in production should be done carefully and only if absolutely necessary, as it can overwrite or duplicate existing data. Ensure your seed scripts are idempotent.

## 4. Cloud Build Setup

Cloud Build is used to automate the build, test, and deployment process. The Cloud Build service account requires specific IAM roles to perform its tasks.

The default Cloud Build service account (`[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`) needs the following IAM roles:

*   **Cloud Run Developer**: `roles/run.developer` (Allows deploying new revisions to Cloud Run services)
*   **Service Account User**: `roles/iam.serviceAccountUser` (Allows Cloud Build to impersonate the Cloud Run service account used by the deployed application)
*   **Secret Manager Secret Accessor**: `roles/secretmanager.secretAccessor` (If environment variables are stored in Secret Manager and accessed during the build or by the deployed service)
*   **Cloud SQL Client**: `roles/cloudsql.client` (If database migrations are run *directly from Cloud Build* against a Cloud SQL instance using Cloud SQL Proxy. Highly recommended for CI/CD database interactions.)
*   **Storage Object Admin**: `roles/storage.objectAdmin` (To store build artifacts and container images in Google Cloud Storage)
*   **Artifact Registry Writer**: `roles/artifactregistry.writer` (If pushing Docker images to Artifact Registry, which is the recommended practice)
*   **Pub/Sub Publisher**: `roles/pubsub.publisher` (If Cloud Build needs to publish messages, e.g., to trigger other workflows or for audit logs/notifications)

You can grant these roles using the GCP Console or `gcloud` CLI:

```bash
# Example for Cloud Run Developer role
gcloud projects add-iam-policy-binding your-gcp-project-id \
    --member="serviceAccount:$(gcloud projects describe your-gcp-project-id --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
    --role="roles/run.developer"

# Repeat the above command for each required role, replacing roles/run.developer with the appropriate role.
```

The Cloud Run service itself will also need specific roles, typically granted to a custom service account associated with the Cloud Run revision (e.g., `paysurity-cloudrun-sa@your-gcp-project-id.iam.gserviceaccount.com`):

*   **Cloud SQL Client**: `roles/cloudsql.client` (To connect to Cloud SQL from the running application)
*   **Secret Manager Secret Accessor**: `roles/secretmanager.secretAccessor` (To access secrets during runtime)
*   **Pub/Sub Publisher**: `roles/pubsub.publisher` (For publishing audit logs or other events)

## 5. Rolling Deployment Strategy

PaySurity utilizes Cloud Run's built-in rolling deployment capabilities to ensure zero-downtime updates and a smooth transition to new versions.

1.  **Build and Push Container Image**: Cloud Build compiles the application and pushes the new Docker image to Artifact Registry.
2.  **Create New Cloud Run Revision**: Cloud Build triggers Cloud Run to deploy a new revision using the latest container image. This revision initially receives 0% of incoming traffic.
3.  **Health Checks**: Cloud Run automatically performs health checks on the new revision. If the health checks fail, the deployment is aborted.
4.  **Traffic Migration**: If health checks pass, Cloud Run by default instantly shifts all traffic to the new healthy revision. For a more gradual rollout or canary deployment, you can manually configure traffic splitting after the new revision is deployed.
    *   **Automated All-at-Once (Default)**: If the new revision is healthy, all traffic is moved. This is the simplest strategy.
    *   **Manual Traffic Splitting (Canary Deployment)**:
        ```bash
        # 1. Deploy a new revision, but keep traffic at 0%
        gcloud run deploy paysurity-service \
            --image gcr.io/your-gcp-project-id/paysurity:latest \
            --no-traffic \
            --region your-gcp-region \
            --platform managed \
            --revision-suffix=v2-beta # Optional, helps identify the revision

        # 2. Monitor the new revision (e.g., Revision_2). Get its full name from `gcloud run revisions list`.
        # Once confident, split traffic (e.g., 10% to new, 90% to old stable)
        gcloud run services update paysurity-service \
            --traffic "Revision_2=10,Revision_1=90" \
            --region your-gcp-region \
            --platform managed

        # 3. After further monitoring and confidence, shift all traffic to the new revision
        gcloud run services update paysurity-service \
            --to-latest \
            --region your-gcp-region \
            --platform managed
        ```
5.  **Old Revision Deprecation**: Once 100% of traffic is on the new revision, the old revision remains available but receives no traffic. It can be easily rolled back to if issues arise.

## 6. Rollback Procedure

In the event of an issue detected after a new deployment, Cloud Run allows for a quick rollback to a previous stable revision with minimal downtime.

1.  **Identify Stable Revision**:
    Use the GCP Console or `gcloud` CLI to identify the last known good revision for your Cloud Run service.
    ```bash
    gcloud run revisions list --service=paysurity-service --region=your-gcp-region --platform=managed
    ```
    Look for a revision that was stable prior to the problematic deployment (e.g., `paysurity-service-00001-abc`).

2.  **Rollback Traffic**:
    Shift 100% of the traffic back to the identified stable revision.
    ```bash
    gcloud run services update paysurity-service \
        --to-revision=YOUR_STABLE_REVISION_NAME \
        --region your-gcp-region \
        --platform managed
    ```
    This action immediately routes all incoming requests to the specified older revision, effectively rolling back the application.

3.  **Monitor**:
    After initiating the rollback, closely monitor the application's health, error rates, and key metrics in Cloud Monitoring to confirm stability has been restored.

*Important Note on Database Rollbacks*: This rollback procedure only reverts the application code. If a problematic deployment included database schema changes (migrations), rolling back the application code *might not* be sufficient, especially if the new code introduced non-backward-compatible database changes. Always design database migrations to be backward-compatible or have a well-defined database rollback plan.

## 7. Health Check URLs

The PaySurity application provides the following endpoints for health and readiness checks:

*   **`/health`**:
    *   **Purpose**: A simple endpoint to indicate the application process is running. This is typically used for liveness probes by Cloud Run, ensuring the container hasn't frozen.
    *   **Expected Response**: HTTP 200 OK.
*   **`/readiness`**:
    *   **Purpose**: Indicates whether the application is ready to accept traffic. This might involve checking critical dependencies like database connections, message queue connectivity, and internal component initialization. Used for readiness probes.
    *   **Expected Response**: HTTP 200 OK if ready, HTTP 503 Service Unavailable if not ready.

Cloud Run automatically configures HTTP health checks on the `/` path by default. It's recommended to configure custom health check paths for `/health` (liveness) and `/readiness` (readiness) for more robust checks.

```bash
# Example of deploying with custom health check paths
gcloud run deploy paysurity-service \
    --image gcr.io/your-gcp-project-id/paysurity:latest \
    --region your-gcp-region \
    --platform managed \
    --port 8080 \
    --cpu 1 \
    --memory 512Mi \
    --allow-unauthenticated \
    --set-env-vars=DATABASE_URL="...",JWT_SECRET="..." \
    --liveness-probe-path=/health \
    --readiness-probe-path=/readiness \
    --liveness-probe-timeout-seconds=5 \
    --readiness-probe-timeout-seconds=10 \
    --min-instances=1 # Keep at least one instance running for quick cold start
```

## 8. Monitoring

Robust monitoring is crucial for maintaining the health and performance of the PaySurity platform. Google Cloud Monitoring (formerly Stackdriver) provides comprehensive tools for this.

**Key Metrics to Monitor**:

*   **Cloud Run**:
    *   Request Count, Latency, Error Rate (4xx, 5xx)
    *   Container Instance Count, CPU Utilization, Memory Utilization
    *   Request Billable Time, Container Startup Latency
*   **Cloud SQL**:
    *   CPU Utilization, Memory Utilization, Disk Utilization, I/O Operations
    *   Database Connections (active, idle, aborted)
    *   Replication Lag (if applicable for read replicas)
    *   Slow Queries, Transaction Throughput
*   **Pub/Sub (for Audit Logs)**:
    *   Message Count, Unacked Messages, Oldest Unacked Message Age (for subscriptions)
    *   Publish Latency, Pull Latency
*   **General Application Metrics**:
    *   Custom metrics exported by the application (e.g., payment processing success rate, tenant-specific request counts, loyalty redemption rates).

**Cloud Monitoring Dashboards**:

It is highly recommended to create custom Cloud Monitoring dashboards for PaySurity. Here are placeholder links to help you navigate (you'll need to create the actual dashboards and replace `your-gcp-project-id`):

*   **PaySurity Overview Dashboard**:
    [https://console.cloud.google.com/monitoring/dashboards/custom/your-paysurity-overview-dashboard?project=your-gcp-project-id](https://console.cloud.google.com/monitoring/dashboards/custom/your-paysurity-overview-dashboard?project=your-gcp-project-id)
    *   *Includes*: Key Cloud Run metrics (request count, latency, error rate), overall application health, and high-level database health.

*   **Cloud Run Service Dashboard (PaySurity)**:
    [https://console.cloud.google.com/monitoring/dashboards/cloudrun_service?project=your-gcp-project-id&resource=cloud_run_service/paysurity-service](https://console.cloud.google.com/monitoring/dashboards/cloudrun_service?project=your-gcp-project-id&resource=cloud_run_service/paysurity-service)
    *   *Includes*: Auto-generated detailed metrics for the `paysurity-service` Cloud Run service.

*   **Cloud SQL Instance Dashboard (PaySurity DB)**:
    [https://console.cloud.google.com/monitoring/dashboards/cloudsql_instance?project=your-gcp-project-id&resource=cloudsql_database/paysurity-db-instance](https://console.cloud.google.com/monitoring/dashboards/cloudsql_instance?project=your-gcp-project-id&resource=cloudsql_database/paysurity-db-instance)
    *   *Includes*: Auto-generated detailed metrics for the `paysurity-db-instance` Cloud SQL instance.

*   **Audit Log Topic Dashboard**:
    [https://console.cloud.google.com/monitoring/dashboards/custom/your-paysurity-audit-logs-dashboard?project=your-gcp-project-id](https://console.cloud.google.com/monitoring/dashboards/custom/your-paysurity-audit-logs-dashboard?project=your-gcp-project-id)
    *   *Includes*: Pub/Sub topic and subscription metrics for `paysurity-audit-logs` to monitor audit log flow.

**Alerting**:
Configure alerting policies in Cloud Monitoring for critical thresholds. Key alerts should include:
*   High error rates (e.g., 5xx errors > 1% for 5 minutes)
*   Increased latency (e.g., p99 latency > 500ms for 10 minutes)
*   High CPU/Memory utilization (> 80% for Cloud Run instances or Cloud SQL)
*   Cloud SQL disk full prediction or high disk utilization
*   Absence of expected audit log messages or high oldest unacked message age
*   Health check failures (liveness/readiness)

This guide covers the essential steps for deploying PaySurity on GCP. Remember to replace placeholder values like `your-gcp-project-id`, `your-region`, and specific service names with your actual project details and to implement secure secret management practices for sensitive environment variables.
