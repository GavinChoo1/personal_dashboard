import os
import logging
from typing import Any, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from gmail_analyzer.config import settings

logger = logging.getLogger("drive_service")

class DriveService:
    def __init__(self):
        self.creds_file = settings.google_application_credentials
        self.scopes = ["https://www.googleapis.com/auth/drive.readonly"]
        self.service = None
        self._initialize_service()

    def _initialize_service(self):
        try:
            if os.path.exists(self.creds_file):
                creds = service_account.Credentials.from_service_account_file(
                    self.creds_file, scopes=self.scopes
                )
                self.service = build("drive", "v3", credentials=creds)
                logger.info("Google Drive service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Drive service: {e}")
            self.service = None

    def list_folders(self) -> list[dict[str, Any]]:
        """
        Lists all folders shared with or accessible by the service account.
        """
        if not self.service:
            return []
        try:
            results = self.service.files().list(
                q="mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                pageSize=50,
                fields="nextPageToken, files(id, name, webViewLink, shared, owners)"
            ).execute()
            return results.get("files", [])
        except Exception as e:
            logger.error(f"Error listing Drive folders: {e}")
            return []

    def list_all_files(self, folder_id: Optional[str] = None) -> list[dict[str, Any]]:
        """
        Lists files in Drive, optionally filtered by a specific folder ID.
        """
        if not self.service:
            return []
        try:
            q = "trashed = false"
            if folder_id:
                q += f" and '{folder_id}' in parents"
            results = self.service.files().list(
                q=q,
                pageSize=50,
                fields="nextPageToken, files(id, name, mimeType, size, webViewLink)"
            ).execute()
            return results.get("files", [])
        except Exception as e:
            logger.error(f"Error listing Drive files: {e}")
            return []

drive_service = DriveService()
