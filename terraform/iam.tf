# -----------------------------------------------------------------------------
# Service Account & IAM Roles for Backend Sync Worker
# -----------------------------------------------------------------------------

resource "google_service_account" "analyzer_sa" {
  account_id   = "gmail-analyzer-sa"
  display_name = "Gmail Personal Analyzer Backend Service Account"
  description  = "Dedicated service account used by the personal email analyzer to interact with BigQuery and Storage."

  depends_on = [
    google_project_service.enabled_apis["iam.googleapis.com"]
  ]
}

# Grant Cloud Storage Object Admin on the staging bucket
resource "google_storage_bucket_iam_member" "storage_admin" {
  bucket = google_storage_bucket.takeout_staging.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.analyzer_sa.email}"
}

# Grant BigQuery Data Editor on the project to read/write tables
resource "google_project_iam_member" "bq_data_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.analyzer_sa.email}"

  depends_on = [
    google_project_service.enabled_apis["bigquery.googleapis.com"],
    google_service_account.analyzer_sa
  ]
}

# Grant BigQuery Job User on the project to execute query and streaming jobs
resource "google_project_iam_member" "bq_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.analyzer_sa.email}"

  depends_on = [
    google_project_service.enabled_apis["bigquery.googleapis.com"],
    google_service_account.analyzer_sa
  ]
}

# -----------------------------------------------------------------------------
# Optional Local Service Account Key Generation
# Writes credentials directly to backend/service-account.json for local dev
# -----------------------------------------------------------------------------

resource "google_service_account_key" "sa_key" {
  count              = var.create_service_account_key ? 1 : 0
  service_account_id = google_service_account.analyzer_sa.name
}

resource "local_file" "backend_sa_key" {
  count           = var.create_service_account_key ? 1 : 0
  content         = base64decode(google_service_account_key.sa_key[0].private_key)
  filename        = "${path.module}/../backend/service-account.json"
  file_permission = "0600"
}
