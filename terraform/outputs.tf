output "database_public_ip" {
  description = "The public IP address of the primary Cloud SQL instance"
  value       = google_sql_database_instance.paysurity_db.public_ip_address
}

output "storefront_url" {
  description = "The public URL of the Headless Storefront Engine"
  value       = google_cloud_run_v2_service.storefront_engine.uri
}

output "payment_api_url" {
  description = "The public URL of the Payment Orchestration Engine"
  value       = google_cloud_run_v2_service.payment_orchestration.uri
}

output "underwriting_api_url" {
  description = "The public URL of the Underwriting Engine"
  value       = google_cloud_run_v2_service.underwriting_engine.uri
}
