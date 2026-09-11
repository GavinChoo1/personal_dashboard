import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

class Settings(BaseSettings):
    # Google Cloud & BigQuery Settings (optional warehouse sync)
    gcp_project_id: str = "personal-dashboard-507703"
    bigquery_dataset: str = "gmail_analyzer"
    gcs_bucket_name: str = "personal-dashboard-507703-gmail-takeout-staging"
    google_application_credentials: str = str(PROJECT_ROOT / "backend" / "service-account.json")

    # Google Gemini AI Settings
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Gmail OAuth2 Client Settings
    gmail_client_secrets_file: str = str(BASE_DIR / "credentials.json")
    gmail_token_file: str = str(BASE_DIR / "token.json")

    # Local SQLite Fallback & Fast Cache Database
    database_url: str = f"sqlite:///{BASE_DIR / 'email_analyzer.db'}"

    # Google Drive & External Table Settings
    google_drive_mount_path: str = r"G:\My Drive"
    google_drive_email_folder: str = r"G:\My Drive\personal_dashboard\emails"
    external_table_filename: str = "emails_past_3d.jsonl"

    @property
    def external_table_path(self) -> Path:
        primary_dir = Path(self.google_drive_email_folder)
        if primary_dir.parent.parent.exists():  # e.g. G:\My Drive exists
            return primary_dir / self.external_table_filename
        # Fallback to local project folder if G: is not mounted
        fallback_dir = BASE_DIR / "external_data" / "emails"
        return fallback_dir / self.external_table_filename

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
