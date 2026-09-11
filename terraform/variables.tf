variable "project_id" {
  type        = string
  description = "The GCP Project ID"
  default     = "paysurity-platform-2026"
}

variable "region" {
  type        = string
  description = "The GCP Region"
  default     = "us-central1"
}

variable "db_password" {
  type        = string
  description = "The root password for Cloud SQL PostgreSQL"
  sensitive   = true
}
