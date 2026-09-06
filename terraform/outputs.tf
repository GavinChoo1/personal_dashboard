output "project_id" {
  description = "The Google Cloud Project ID"
  value       = var.project_id
}

output "storage_bucket_name" {
  description = "Google Cloud Storage bucket for email data and uploads"
  value       = google_storage_bucket.takeout_staging.name
}

output "service_account_email" {
  description = "Service Account email used for backend sync and BigQuery access"
  value       = google_service_account.analyzer_sa.email
}

output "service_account_key_path" {
  description = "Path to the local credentials file for backend configuration"
  value       = var.create_service_account_key ? "backend/service-account.json" : "Key creation disabled"
}

output "bigquery_dataset_id" {
  description = "The BigQuery dataset ID"
  value       = google_bigquery_dataset.gmail_analyzer.dataset_id
}

output "bigquery_dataset_full_id" {
  description = "The full resource ID of the BigQuery dataset"
  value       = "${var.project_id}:${google_bigquery_dataset.gmail_analyzer.dataset_id}"
}

output "bigquery_tables" {
  description = "List of created BigQuery tables"
  value = {
    messages      = google_bigquery_table.messages.table_id
    threads       = google_bigquery_table.threads.table_id
    action_items  = google_bigquery_table.action_items.table_id
    subscriptions = google_bigquery_table.subscriptions.table_id
  }
}
