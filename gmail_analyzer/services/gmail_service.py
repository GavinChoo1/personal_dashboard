import os
import base64
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional
from email.utils import parseaddr

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from gmail_analyzer.config import settings

logger = logging.getLogger("gmail_service")

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

class GmailService:
    def __init__(self):
        self.token_file = Path(settings.gmail_token_file)
        self.client_secrets_file = Path(settings.gmail_client_secrets_file)
        self.service = None

    def is_authenticated(self) -> bool:
        if not self.token_file.exists():
            return False
        try:
            creds = Credentials.from_authorized_user_file(str(self.token_file), SCOPES)
            if creds.valid or (creds.expired and creds.refresh_token):
                return True
        except Exception:
            return False
        return False

    def get_service(self):
        if not self.token_file.exists():
            return None
        try:
            creds = Credentials.from_authorized_user_file(str(self.token_file), SCOPES)
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                with open(self.token_file, "w", encoding="utf-8") as f:
                    f.write(creds.to_json())
            self.service = build("gmail", "v1", credentials=creds)
            return self.service
        except Exception as e:
            logger.error(f"Failed to initialize Gmail API client: {e}")
            return None

    def fetch_past_3_days(self) -> tuple[list[dict[str, Any]], bool, str]:
        """
        Fetches emails from the past 3 days using Gmail API.
        Returns (messages_list, is_live_api, status_message).
        """
        service = self.get_service()
        if not service:
            logger.info("Gmail credentials not detected. Live Gmail sync disabled until authenticated.")
            return (
                [],
                False,
                "Gmail OAuth token not found. To sync your real Gmail account, place credentials.json in backend/ and run 'python backend/scripts/auth_gmail.py'."
            )

        try:
            # Query for emails newer than 3 days
            query = "newer_than:3d"
            response = service.users().messages().list(userId="me", q=query, maxResults=100).execute()
            messages_meta = response.get("messages", [])

            if not messages_meta:
                return ([], True, "Live Gmail API queried: 0 emails found in the past 3 days.")

            parsed_messages = []
            for item in messages_meta:
                msg_id = item["id"]
                msg_data = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
                parsed = self._parse_message(msg_data)
                if parsed:
                    parsed_messages.append(parsed)

            return (parsed_messages, True, f"Successfully fetched {len(parsed_messages)} emails from live Gmail API.")

        except Exception as e:
            logger.error(f"Error fetching from Gmail API: {e}")
            return (
                [],
                False,
                f"Gmail API query failed: {e}"
            )

    def _parse_message(self, msg: dict[str, Any]) -> Optional[dict[str, Any]]:
        try:
            msg_id = msg.get("id")
            thread_id = msg.get("threadId")
            payload = msg.get("payload", {})
            headers = {h["name"].lower(): h["value"] for h in payload.get("headers", [])}

            raw_from = headers.get("from", "")
            sender_name, sender_email = parseaddr(raw_from)
            if not sender_email:
                sender_email = raw_from
            if not sender_name:
                sender_name = sender_email.split("@")[0]

            recipient = headers.get("to", "")
            subject = headers.get("subject", "(No Subject)")
            snippet = msg.get("snippet", "")

            # Timestamp parsing
            internal_date_ms = int(msg.get("internalDate", 0))
            if internal_date_ms:
                internal_dt = datetime.fromtimestamp(internal_date_ms / 1000.0, tz=timezone.utc)
            else:
                internal_dt = datetime.now(timezone.utc)

            labels = msg.get("labelIds", [])
            is_unread = "UNREAD" in labels
            is_starred = "STARRED" in labels

            # Category inference
            category = "Primary"
            if "CATEGORY_PROMOTIONS" in labels:
                category = "Promotions"
            elif "CATEGORY_UPDATES" in labels:
                category = "Updates"
            elif "CATEGORY_SOCIAL" in labels:
                category = "Social"
            elif "CATEGORY_FORUMS" in labels:
                category = "Forums"
            elif any(k in subject.lower() or k in snippet.lower() for k in ["invoice", "receipt", "billing", "payment", "bank"]):
                category = "Finance"
            elif any(k in subject.lower() for k in ["newsletter", "digest", "weekly", "edition"]):
                category = "Newsletters"

            # Check attachments
            has_attachments = False
            parts = payload.get("parts", [])
            body_plain = snippet
            for part in parts:
                filename = part.get("filename")
                if filename:
                    has_attachments = True
                if part.get("mimeType") == "text/plain" and "data" in part.get("body", {}):
                    try:
                        decoded = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
                        if decoded:
                            body_plain = decoded[:2000]
                    except Exception:
                        pass

            # Priority score
            priority = 0.5
            if is_starred:
                priority += 0.3
            if category == "Primary":
                priority += 0.2
            elif category == "Finance":
                priority += 0.15
            elif category in ["Promotions", "Social"]:
                priority -= 0.3
            priority = max(0.05, min(1.0, priority))

            return {
                "message_id": msg_id,
                "thread_id": thread_id,
                "sender_name": sender_name,
                "sender_email": sender_email,
                "recipient": recipient,
                "subject": subject,
                "snippet": snippet,
                "body_plain": body_plain,
                "internal_date": internal_dt.isoformat(),
                "labels": labels,
                "is_unread": is_unread,
                "is_starred": is_starred,
                "has_attachments": has_attachments,
                "category": category,
                "priority_score": round(priority, 2),
                "list_unsubscribe_url": headers.get("list-unsubscribe"),
                "synced_at": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as e:
            logger.error(f"Error parsing message {msg.get('id')}: {e}")
            return None

gmail_service = GmailService()
