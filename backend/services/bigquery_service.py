import logging
from datetime import datetime, date
from typing import Any, Optional
import os
from google.cloud import bigquery
from google.oauth2 import service_account
from backend.config import settings

logger = logging.getLogger("bigquery_service")

class BigQueryService:
    def __init__(self):
        self.project_id = settings.gcp_project_id
        self.dataset_id = settings.bigquery_dataset
        self.client: Optional[bigquery.Client] = None
        self._initialize_client()

    def _initialize_client(self):
        try:
            if os.path.exists(settings.google_application_credentials):
                credentials = service_account.Credentials.from_service_account_file(
                    settings.google_application_credentials
                )
                self.client = bigquery.Client(project=self.project_id, credentials=credentials)
                logger.info("BigQuery client initialized using service-account.json")
            else:
                self.client = bigquery.Client(project=self.project_id)
                logger.info("BigQuery client initialized using Application Default Credentials (ADC)")
        except Exception as e:
            logger.warning(f"Could not connect to Google BigQuery: {e}. Falling back to local cache.")
            self.client = None

    def is_connected(self) -> bool:
        if not self.client:
            return False
        try:
            dataset_ref = self.client.dataset(self.dataset_id)
            self.client.get_dataset(dataset_ref)
            return True
        except Exception:
            return False

    def get_table_ref(self, table_name: str):
        return f"{self.project_id}.{self.dataset_id}.{table_name}"

    def insert_messages(self, messages: list[dict[str, Any]]) -> bool:
        if not self.client or not messages:
            return False
        table_ref = self.get_table_ref("messages")
        try:
            formatted_rows = []
            for msg in messages:
                internal_date = msg.get("internal_date")
                if isinstance(internal_date, (datetime, date)):
                    internal_date_str = internal_date.isoformat()
                else:
                    internal_date_str = str(internal_date)

                inserted_at = msg.get("inserted_at", datetime.utcnow())
                if isinstance(inserted_at, (datetime, date)):
                    inserted_at_str = inserted_at.isoformat()
                else:
                    inserted_at_str = str(inserted_at)

                row = {
                    "message_id": msg["message_id"],
                    "thread_id": msg["thread_id"],
                    "sender_name": msg.get("sender_name"),
                    "sender_email": msg["sender_email"],
                    "recipient": msg.get("recipient"),
                    "subject": msg.get("subject"),
                    "snippet": msg.get("snippet"),
                    "body_plain": msg.get("body_plain"),
                    "internal_date": internal_date_str,
                    "labels": msg.get("labels", []),
                    "is_unread": bool(msg.get("is_unread", False)),
                    "is_starred": bool(msg.get("is_starred", False)),
                    "has_attachments": bool(msg.get("has_attachments", False)),
                    "attachment_count": int(msg.get("attachment_count", 0)),
                    "list_unsubscribe_url": msg.get("list_unsubscribe_url"),
                    "category": msg.get("category", "Primary"),
                    "priority_score": float(msg.get("priority_score", 0.5)),
                    "inserted_at": inserted_at_str,
                }
                formatted_rows.append(row)

            errors = self.client.insert_rows_json(table_ref, formatted_rows)
            if errors:
                logger.error(f"BigQuery insert_messages errors: {errors}")
                return False
            return True
        except Exception as e:
            logger.error(f"Failed to stream rows into BigQuery: {e}")
            return False

    def query_overview_stats(self) -> dict[str, Any]:
        if not self.client:
            return {}
        query = f"""
        SELECT
            COUNT(1) as total_messages,
            COUNTIF(is_unread = TRUE) as unread_messages,
            COUNT(DISTINCT sender_email) as total_unique_senders,
            COUNTIF(category = 'Promotions') as promotional_count,
            COUNTIF(category = 'Newsletters') as newsletter_count,
            COUNTIF(has_attachments = TRUE) as attachment_count,
            MIN(DATE(internal_date)) as earliest_date,
            MAX(DATE(internal_date)) as latest_date
        FROM `{self.get_table_ref('messages')}`
        """
        try:
            query_job = self.client.query(query)
            results = list(query_job.result())
            if results:
                row = results[0]
                return {
                    "total_messages": row.total_messages or 0,
                    "unread_messages": row.unread_messages or 0,
                    "total_unique_senders": row.total_unique_senders or 0,
                    "promotional_count": row.promotional_count or 0,
                    "newsletter_count": row.newsletter_count or 0,
                    "attachment_count": row.attachment_count or 0,
                    "earliest_date": str(row.earliest_date) if row.earliest_date else None,
                    "latest_date": str(row.latest_date) if row.latest_date else None,
                }
        except Exception as e:
            logger.error(f"BigQuery overview query failed: {e}")
        return {}

    def query_top_senders(self, limit: int = 8) -> list[dict[str, Any]]:
        if not self.client:
            return []
        query = f"""
        SELECT
            sender_email,
            ANY_VALUE(sender_name) as sender_name,
            COUNT(1) as message_count,
            COUNTIF(is_unread = TRUE) as unread_count,
            ANY_VALUE(category) as primary_category
        FROM `{self.get_table_ref('messages')}`
        GROUP BY sender_email
        ORDER BY message_count DESC
        LIMIT {limit}
        """
        try:
            query_job = self.client.query(query)
            return [
                {
                    "sender_email": r.sender_email,
                    "sender_name": r.sender_name or r.sender_email.split("@")[0],
                    "message_count": r.message_count,
                    "unread_count": r.unread_count,
                    "primary_category": r.primary_category or "Other",
                }
                for r in query_job.result()
            ]
        except Exception as e:
            logger.error(f"BigQuery top senders query failed: {e}")
            return []

    def query_category_distribution(self) -> list[dict[str, Any]]:
        if not self.client:
            return []
        query = f"""
        SELECT
            COALESCE(category, 'Other') as category,
            COUNT(1) as count
        FROM `{self.get_table_ref('messages')}`
        GROUP BY category
        ORDER BY count DESC
        """
        try:
            query_job = self.client.query(query)
            return [{"category": r.category, "count": r.count} for r in query_job.result()]
        except Exception as e:
            logger.error(f"BigQuery category query failed: {e}")
            return []

    def query_volume_trends(self) -> list[dict[str, Any]]:
        if not self.client:
            return []
        query = f"""
        SELECT
            FORMAT_DATE('%Y-%m-%d', DATE(internal_date)) as date,
            COUNT(1) as count,
            COUNTIF(is_unread = TRUE) as unread_count
        FROM `{self.get_table_ref('messages')}`
        GROUP BY date
        ORDER BY date ASC
        LIMIT 30
        """
        try:
            query_job = self.client.query(query)
            return [
                {"date": r.date, "count": r.count, "unread_count": r.unread_count}
                for r in query_job.result()
            ]
        except Exception as e:
            logger.error(f"BigQuery volume trends query failed: {e}")
            return []

    def query_hourly_distribution(self) -> list[dict[str, Any]]:
        if not self.client:
            return []
        query = f"""
        SELECT
            EXTRACT(HOUR FROM internal_date) as hour,
            COUNT(1) as count
        FROM `{self.get_table_ref('messages')}`
        GROUP BY hour
        ORDER BY hour ASC
        """
        try:
            query_job = self.client.query(query)
            return [{"hour": r.hour, "count": r.count} for r in query_job.result()]
        except Exception as e:
            logger.error(f"BigQuery hourly query failed: {e}")
            return []

bigquery_service = BigQueryService()
