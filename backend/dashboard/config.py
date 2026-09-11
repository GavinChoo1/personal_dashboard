import os
from pathlib import Path
from pydantic_settings import BaseSettings

DASHBOARD_DIR = Path(__file__).resolve().parent
BACKEND_DIR = DASHBOARD_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

class Settings(BaseSettings):
    # Google Cloud & BigQuery Settings
    gcp_project_id: str = "personal-dashboard-507703"
    bigquery_dataset: str = "gmail_analyzer"
    gcs_bucket_name: str = "personal-dashboard-507703-gmail-takeout-staging"
    google_application_credentials: str = str(BACKEND_DIR / "service-account.json")

    # Server Settings
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ]

    class Config:
        env_file = str(PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure Google Application Credentials environment variable is set if the key file exists
if os.path.exists(settings.google_application_credentials):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
