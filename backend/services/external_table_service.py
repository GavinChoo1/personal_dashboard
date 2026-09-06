import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Optional
import pandas as pd
from backend.config import settings

logger = logging.getLogger("external_table_service")

class ExternalTableService:
    def __init__(self):
        self._target_path = settings.external_table_path

    @property
    def target_file(self) -> Path:
        return settings.external_table_path

    @property
    def target_dir(self) -> Path:
        return self.target_file.parent

    def write_emails(self, emails: list[dict[str, Any]]) -> tuple[bool, str, int]:
        """
        Persists email records directly into Google Drive external table storage (.jsonl and .parquet).
        """
        try:
            self.target_dir.mkdir(parents=True, exist_ok=True)

            # 1. Write newline-delimited JSON (.jsonl)
            jsonl_path = self.target_file
            with open(jsonl_path, "w", encoding="utf-8") as f:
                for email in emails:
                    f.write(json.dumps(email, ensure_ascii=False) + "\n")

            # 2. Write optimized Parquet companion (.parquet)
            parquet_path = self.target_dir / "emails_past_3d.parquet"
            df = pd.DataFrame(emails)
            df.to_parquet(parquet_path, index=False)

            logger.info(f"Successfully wrote {len(emails)} records to Google Drive external table: {jsonl_path}")
            return True, str(jsonl_path), len(emails)

        except Exception as e:
            logger.error(f"Failed to write emails to Google Drive external table: {e}")
            return False, str(e), 0

    def get_status(self) -> dict[str, Any]:
        """
        Returns metadata and connection status of the Google Drive external table.
        """
        file_path = self.target_file
        if not file_path.exists():
            return {
                "exists": False,
                "file_path": str(file_path),
                "is_google_drive": "Google" in str(file_path) or "My Drive" in str(file_path) or "G:" in str(file_path),
                "record_count": 0,
                "size_bytes": 0,
                "last_modified": None,
                "storage_type": "Google Drive External Table (NDJSON & Parquet)",
            }

        stat = file_path.stat()
        df = self._read_data()
        count = len(df) if df is not None else 0

        return {
            "exists": True,
            "file_path": str(file_path),
            "is_google_drive": "Google" in str(file_path) or "My Drive" in str(file_path) or "G:" in str(file_path),
            "record_count": count,
            "size_bytes": stat.st_size,
            "last_modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "storage_type": "Google Drive External Table (NDJSON & Parquet)",
        }

    def _read_data(self) -> Optional[pd.DataFrame]:
        file_path = self.target_file
        if not file_path.exists():
            return None
        try:
            parquet_path = self.target_dir / "emails_past_3d.parquet"
            if parquet_path.exists():
                return pd.read_parquet(parquet_path)
            return pd.read_json(file_path, lines=True)
        except Exception as e:
            logger.error(f"Error reading external table file {file_path}: {e}")
            return None

    def query_overview(self) -> dict[str, Any]:
        """
        Queries summary metrics directly from the Google Drive external table.
        """
        df = self._read_data()
        if df is None or df.empty:
            return {}

        total = len(df)
        unread = int(df["is_unread"].sum()) if "is_unread" in df else 0
        unique_senders = int(df["sender_email"].nunique()) if "sender_email" in df else 0
        promo = int((df["category"] == "Promotions").sum()) if "category" in df else 0
        news = int((df["category"] == "Newsletters").sum()) if "category" in df else 0
        finance = int((df["category"] == "Finance").sum()) if "category" in df else 0
        attachments = int(df["has_attachments"].sum()) if "has_attachments" in df else 0

        dates = pd.to_datetime(df["internal_date"], errors="coerce")
        earliest = dates.min().strftime("%Y-%m-%d %H:%M") if not dates.empty and pd.notnull(dates.min()) else None
        latest = dates.max().strftime("%Y-%m-%d %H:%M") if not dates.empty and pd.notnull(dates.max()) else None

        return {
            "source": f"Google Drive External Table ({self.target_file.name})",
            "is_external_table": True,
            "total_messages": total,
            "unread_messages": unread,
            "total_unique_senders": unique_senders,
            "promotional_count": promo,
            "newsletter_count": news,
            "finance_count": finance,
            "attachment_count": attachments,
            "newsletter_clutter_count": promo + news,
            "date_range": {
                "earliest": earliest,
                "latest": latest,
            }
        }

    def query_emails(
        self,
        category: Optional[str] = None,
        unread_only: bool = False,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 25
    ) -> dict[str, Any]:
        """
        Filters and queries emails directly from the Google Drive external table.
        """
        df = self._read_data()
        if df is None or df.empty:
            return {"total": 0, "items": []}

        filtered = df.copy()

        if category and category != "All":
            filtered = filtered[filtered["category"] == category]

        if unread_only and "is_unread" in filtered:
            filtered = filtered[filtered["is_unread"] == True]

        if search:
            search_str = search.lower()
            subject_mask = filtered["subject"].astype(str).str.lower().str.contains(search_str, na=False)
            sender_mask = filtered["sender_name"].astype(str).str.lower().str.contains(search_str, na=False)
            email_mask = filtered["sender_email"].astype(str).str.lower().str.contains(search_str, na=False)
            snippet_mask = filtered["snippet"].astype(str).str.lower().str.contains(search_str, na=False)
            filtered = filtered[subject_mask | sender_mask | email_mask | snippet_mask]

        total = len(filtered)

        # Sort descending by internal_date
        if "internal_date" in filtered:
            filtered["_sort_dt"] = pd.to_datetime(filtered["internal_date"], errors="coerce")
            filtered = filtered.sort_values(by="_sort_dt", ascending=False)

        sliced = filtered.iloc[skip : skip + limit]
        items = []
        for _, row in sliced.iterrows():
            thread_id = row.get("thread_id") or row.get("message_id")
            items.append({
                "message_id": str(row.get("message_id", "")),
                "thread_id": str(thread_id),
                "sender_name": str(row.get("sender_name", "")),
                "sender_email": str(row.get("sender_email", "")),
                "recipient": str(row.get("recipient", "")),
                "subject": str(row.get("subject", "")),
                "snippet": str(row.get("snippet", "")),
                "body_plain": str(row.get("body_plain", "")),
                "internal_date": str(row.get("internal_date", "")),
                "category": str(row.get("category", "Primary")),
                "is_unread": bool(row.get("is_unread", False)),
                "is_starred": bool(row.get("is_starred", False)),
                "has_attachments": bool(row.get("has_attachments", False)),
                "priority_score": float(row.get("priority_score", 0.5)),
                "gmail_link": f"https://mail.google.com/mail/u/0/#all/{thread_id}",
                "storage_source": "Google Drive External Table",
            })

        return {"total": total, "items": items}

    def query_top_senders(self, limit: int = 8) -> list[dict[str, Any]]:
        df = self._read_data()
        if df is None or df.empty:
            return []

        grouped = df.groupby("sender_email").agg(
            message_count=("message_id", "count"),
            sender_name=("sender_name", "first"),
            primary_category=("category", "first"),
            unread_count=("is_unread", lambda x: int(x.sum()) if not x.empty else 0),
        ).reset_index()

        grouped = grouped.sort_values(by="message_count", ascending=False).head(limit)
        return grouped.to_dict(orient="records")

    def query_category_distribution(self) -> list[dict[str, Any]]:
        df = self._read_data()
        if df is None or df.empty:
            return []

        grouped = df["category"].value_counts().reset_index()
        grouped.columns = ["category", "count"]
        return grouped.to_dict(orient="records")

    def query_volume_trends(self) -> list[dict[str, Any]]:
        df = self._read_data()
        if df is None or df.empty:
            return []

        df["date"] = pd.to_datetime(df["internal_date"], errors="coerce").dt.strftime("%Y-%m-%d")
        grouped = df.groupby("date").agg(
            count=("message_id", "count"),
            unread_count=("is_unread", lambda x: int(x.sum()) if not x.empty else 0),
        ).reset_index()

        grouped = grouped.sort_values(by="date", ascending=True)
        return grouped.to_dict(orient="records")

external_table_service = ExternalTableService()
