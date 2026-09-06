import os
import json
import logging
from datetime import datetime
from typing import Any, Optional
from google.cloud import storage
from google.oauth2 import service_account
from backend.config import settings

logger = logging.getLogger("gcs_service")

class GCSService:
    def __init__(self):
        self.project_id = settings.gcp_project_id
        self.bucket_name = settings.gcs_bucket_name
        self.client: Optional[storage.Client] = None
        self._initialize_client()

    def _initialize_client(self):
        try:
            if os.path.exists(settings.google_application_credentials):
                credentials = service_account.Credentials.from_service_account_file(
                    settings.google_application_credentials
                )
                self.client = storage.Client(project=self.project_id, credentials=credentials)
                logger.info("GCS client initialized with service-account.json")
            else:
                self.client = storage.Client(project=self.project_id)
                logger.info("GCS client initialized with ADC")
        except Exception as e:
            logger.warning(f"Failed to initialize GCS client: {e}")
            self.client = None

    def is_connected(self) -> bool:
        if not self.client:
            return False
        try:
            bucket = self.client.bucket(self.bucket_name)
            # Efficient check: list 1 blob to verify read/write access
            next(self.client.list_blobs(bucket, max_results=1), None)
            return True
        except Exception:
            return False

    def get_bucket(self):
        if not self.client:
            return None
        return self.client.bucket(self.bucket_name)

    def save_email(self, message: dict[str, Any]) -> bool:
        """
        Saves a single email JSON object to Google Cloud Storage under emails/{message_id}.json
        """
        if not self.client:
            return False
        try:
            bucket = self.get_bucket()
            msg_id = message.get("message_id", f"msg_{int(datetime.utcnow().timestamp())}")
            date_prefix = datetime.utcnow().strftime("%Y/%m")
            blob_path = f"emails/{date_prefix}/{msg_id}.json"
            blob = bucket.blob(blob_path)
            blob.upload_from_string(
                data=json.dumps(message, default=str),
                content_type="application/json"
            )
            logger.info(f"Stored email {msg_id} in GCS at {blob_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save email to GCS: {e}")
            return False

    def save_emails_batch(self, messages: list[dict[str, Any]]) -> int:
        """
        Saves a batch of email messages to Google Cloud Storage.
        Returns the number of successfully saved emails.
        """
        saved = 0
        for msg in messages:
            if self.save_email(msg):
                saved += 1
        return saved

    def list_stored_emails(self, max_results: int = 100) -> list[str]:
        if not self.client:
            return []
        try:
            bucket = self.get_bucket()
            blobs = bucket.list_blobs(prefix="emails/", max_results=max_results)
            return [b.name for b in blobs]
        except Exception as e:
            logger.error(f"Failed to list stored emails from GCS: {e}")
            return []

    def get_storage_stats(self) -> dict[str, Any]:
        if not self.client:
            return {"connected": False, "bucket": self.bucket_name, "files_count": 0, "total_bytes": 0}
        try:
            bucket = self.get_bucket()
            blobs = list(bucket.list_blobs(prefix="emails/"))
            total_bytes = sum(b.size or 0 for b in blobs)
            return {
                "connected": True,
                "bucket": self.bucket_name,
                "files_count": len(blobs),
                "total_bytes": total_bytes,
                "total_kb": round(total_bytes / 1024, 2),
            }
        except Exception as e:
            return {"connected": False, "bucket": self.bucket_name, "error": str(e)}

gcs_service = GCSService()
