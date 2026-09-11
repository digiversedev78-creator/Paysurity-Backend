terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Cloud SQL PostgreSQL Database for Underwriting & Payments
resource "google_sql_database_instance" "paysurity_db" {
  name             = "paysurity-primary-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro" # Switched to micro to save staging costs
    
    # Cold starts / cost savings configured as requested
    availability_type = "ZONAL" # Single zone for staging (save money)
    
    ip_configuration {
      ipv4_enabled = true
    }
  }
}

resource "google_sql_user" "paysurity_user" {
  name     = "paysurity_admin"
  instance = google_sql_database_instance.paysurity_db.name
  password = var.db_password
}

# 2. Cloud Run: Underwriting Engine
resource "google_cloud_run_v2_service" "underwriting_engine" {
  name     = "underwriting-engine"
  location = var.region

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder until Docker build
      
      env {
        name  = "DATABASE_URL"
        value = "postgresql://paysurity_admin:${var.db_password}@${google_sql_database_instance.paysurity_db.public_ip_address}:5432/postgres?schema=public"
      }
    }
    
    scaling {
      min_instance_count = 0 # Cold starts enabled for staging to save cost
      max_instance_count = 10
    }
  }
}

# 3. Cloud Run: Payment Orchestration Engine
resource "google_cloud_run_v2_service" "payment_orchestration" {
  name     = "payment-orchestration-engine"
  location = var.region

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder until Docker build
      
      env {
        name  = "DATABASE_URL"
        value = "postgresql://paysurity_admin:${var.db_password}@${google_sql_database_instance.paysurity_db.public_ip_address}:5432/postgres?schema=public"
      }
    }
    
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }
}

# 4. Cloud Run: Headless Storefront Engine
resource "google_cloud_run_v2_service" "storefront_engine" {
  name     = "storefront-engine"
  location = var.region

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder until Docker build
      
      env {
        name  = "NEXT_PUBLIC_PAYMENT_API_URL"
        value = google_cloud_run_v2_service.payment_orchestration.uri
      }
    }
    
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }
}

# Identity Access Management (Public Access for Storefront & APIs)
resource "google_cloud_run_service_iam_member" "public_storefront" {
  location = google_cloud_run_v2_service.storefront_engine.location
  project  = google_cloud_run_v2_service.storefront_engine.project
  service  = google_cloud_run_v2_service.storefront_engine.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "public_payment_api" {
  location = google_cloud_run_v2_service.payment_orchestration.location
  project  = google_cloud_run_v2_service.payment_orchestration.project
  service  = google_cloud_run_v2_service.payment_orchestration.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "public_underwriting_api" {
  location = google_cloud_run_v2_service.underwriting_engine.location
  project  = google_cloud_run_v2_service.underwriting_engine.project
  service  = google_cloud_run_v2_service.underwriting_engine.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
