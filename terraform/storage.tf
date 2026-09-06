# -----------------------------------------------------------------------------
# Google Cloud Storage Bucket for Takeout .mbox Ingestion & Backups
# -----------------------------------------------------------------------------

locals {
  bucket_name = var.storage_bucket_name != "" ? var.storage_bucket_name : "${var.project_id}-gmail-takeout-staging"
}

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
