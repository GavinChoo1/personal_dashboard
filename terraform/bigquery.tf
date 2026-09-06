# -----------------------------------------------------------------------------
# Google BigQuery Dataset
# -----------------------------------------------------------------------------

resource "google_bigquery_dataset" "gmail_analyzer" {
  dataset_id                  = var.dataset_id
  friendly_name               = "Gmail Personal Analyzer Historical Warehouse"
  description                 = "Scalable historical warehouse storing partitioned Gmail messages, threads, and AI extracted insights."
  location                    = var.dataset_location
  delete_contents_on_destroy  = var.delete_contents_on_destroy

  labels = {
    application = "gmail-analyzer"
    environment = var.environment
  }

  depends_on = [
    google_project_service.enabled_apis["bigquery.googleapis.com"]
  ]
}

# -----------------------------------------------------------------------------
# Table: messages
# Stores all historical emails with daily time-partitioning & clustering
# -----------------------------------------------------------------------------

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

# -----------------------------------------------------------------------------
# Table: threads
# Stores conversation thread rollups and participation metrics
# -----------------------------------------------------------------------------

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

# -----------------------------------------------------------------------------
# Table: action_items
# Stores action items and tasks extracted by Gemini AI from emails
# -----------------------------------------------------------------------------

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

# -----------------------------------------------------------------------------
# Table: subscriptions
# Stores recurring charges, bills, and newsletters with unsubscribe links
# -----------------------------------------------------------------------------

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
