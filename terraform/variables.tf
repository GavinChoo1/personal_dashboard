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
