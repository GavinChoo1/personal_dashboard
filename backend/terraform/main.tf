# =============================================================================
# Google Cloud Infrastructure - All-in-One Configuration
# Personal Gmail Analyzer
# =============================================================================

# -----------------------------------------------------------------------------
# 1. Terraform & Provider Configuration
# -----------------------------------------------------------------------------

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }

  # (Optional for CI/CD) Remote State Storage in Google Cloud Storage:
  # When running in GitHub Actions, uncomment this block so runners share the same state file:
  # backend "gcs" {
  #   bucket = "personal-dashboard-507703-tfstate"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone

  default_labels = {
    application = "gmail-analyzer"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# -----------------------------------------------------------------------------
# 2. Input Variables
# -----------------------------------------------------------------------------

variable "project_id" {
  description = "The Google Cloud Project ID where resources will be provisioned."
  type        = string
}

variable "region" {
  description = "The Google Cloud region for regional resources (e.g. us-central1, europe-west1)."
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The Google Cloud zone for compute/regional resources."
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment identifier (e.g. dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "dataset_id" {
  description = "The ID of the BigQuery dataset that will store historical Gmail data."
  type        = string
  default     = "gmail_analyzer"
}

variable "dataset_location" {
  description = "The geographical location of the BigQuery dataset (e.g. US, EU, asia-northeast1)."
  type        = string
  default     = "US"
}

variable "delete_contents_on_destroy" {
  description = "If true, deleting the dataset will also delete all its tables. Set to false in production to prevent accidental data loss."
  type        = bool
  default     = false
}

variable "storage_bucket_name" {
  description = "Name of the Google Cloud Storage bucket for staging Google Takeout .mbox files and backups. Leave empty to auto-generate from project_id."
  type        = string
  default     = ""
}

variable "create_service_account_key" {
  description = "Whether to generate a service account private key JSON file locally for the backend sync service."
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# 3. Google Cloud Service APIs Activation
# -----------------------------------------------------------------------------

locals {
  services = [
    "bigquery.googleapis.com",
    "bigquerystorage.googleapis.com",
    "gmail.googleapis.com",
    "drive.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ]
  bucket_name = var.storage_bucket_name != "" ? var.storage_bucket_name : "${var.project_id}-gmail-takeout-staging"
}

resource "google_project_service" "enabled_apis" {
  for_each = toset(local.services)

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# 4. Google Cloud Storage (GCS Staging Bucket)
# -----------------------------------------------------------------------------

resource "google_storage_bucket" "takeout_staging" {
  name          = local.bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = false
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age        = 30 # Auto-clean temporary staging files after 30 days
      with_state = "ANY"
    }
  }

  labels = {
    application = "gmail-analyzer"
    environment = var.environment
  }

  depends_on = [
    google_project_service.enabled_apis["storage.googleapis.com"]
  ]
}

# -----------------------------------------------------------------------------
# 5. BigQuery Historical Warehouse (Dataset & Tables)
# -----------------------------------------------------------------------------

resource "google_bigquery_dataset" "gmail_analyzer" {
  dataset_id                 = var.dataset_id
  friendly_name              = "Gmail Personal Analyzer Historical Warehouse"
  description                = "Scalable historical warehouse storing partitioned Gmail messages, threads, and AI extracted insights."
  location                   = var.dataset_location
  delete_contents_on_destroy = var.delete_contents_on_destroy

  labels = {
    application = "gmail-analyzer"
    environment = var.environment
  }

  depends_on = [
    google_project_service.enabled_apis["bigquery.googleapis.com"]
  ]
}

# Table: messages
resource "google_bigquery_table" "messages" {
  dataset_id          = google_bigquery_dataset.gmail_analyzer.dataset_id
  table_id            = "messages"
  description         = "Historical Gmail messages partitioned by internal_date (DAY) and clustered by sender_email & thread_id"
  deletion_protection = false

  time_partitioning {
    type  = "DAY"
    field = "internal_date"
  }

  clustering = ["sender_email", "thread_id"]

  schema = file("${path.module}/schemas/messages.json")

  labels = {
    application = "gmail-analyzer"
    table_type  = "historical_messages"
  }
}

# Table: threads
resource "google_bigquery_table" "threads" {
  dataset_id          = google_bigquery_dataset.gmail_analyzer.dataset_id
  table_id            = "threads"
  description         = "Gmail conversation threads with participant lists and message counts"
  deletion_protection = false

  clustering = ["thread_id"]

  schema = file("${path.module}/schemas/threads.json")

  labels = {
    application = "gmail-analyzer"
    table_type  = "threads"
  }
}

# Table: action_items
resource "google_bigquery_table" "action_items" {
  dataset_id          = google_bigquery_dataset.gmail_analyzer.dataset_id
  table_id            = "action_items"
  description         = "Action items and commitments identified from Gmail messages by Gemini AI"
  deletion_protection = false

  time_partitioning {
    type  = "DAY"
    field = "created_at"
  }

  clustering = ["status", "priority"]

  schema = file("${path.module}/schemas/action_items.json")

  labels = {
    application = "gmail-analyzer"
    table_type  = "action_items"
  }
}

# Table: subscriptions
resource "google_bigquery_table" "subscriptions" {
  dataset_id          = google_bigquery_dataset.gmail_analyzer.dataset_id
  table_id            = "subscriptions"
  description         = "Detected recurring subscriptions, billing receipts, and newsletters"
  deletion_protection = false

  clustering = ["service_name"]

  schema = file("${path.module}/schemas/subscriptions.json")

  labels = {
    application = "gmail-analyzer"
    table_type  = "subscriptions"
  }
}

# -----------------------------------------------------------------------------
# 6. Service Account & IAM Permissions
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

# Service Account Private Key & Local Export to backend/service-account.json
resource "google_service_account_key" "sa_key" {
  count              = var.create_service_account_key ? 1 : 0
  service_account_id = google_service_account.analyzer_sa.name
}

resource "local_file" "backend_sa_key" {
  count           = var.create_service_account_key ? 1 : 0
  content         = base64decode(google_service_account_key.sa_key[0].private_key)
  filename        = "${path.module}/../service-account.json"
  file_permission = "0600"
}

# -----------------------------------------------------------------------------
# 7. Outputs
# -----------------------------------------------------------------------------

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
