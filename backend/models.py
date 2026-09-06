from datetime import datetime
import json
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, Date
)
from backend.database import Base

class EmailMessage(Base):
    __tablename__ = "messages"

    message_id = Column(String, primary_key=True, index=True)
    thread_id = Column(String, index=True, nullable=False)
    sender_name = Column(String, nullable=True)
    sender_email = Column(String, index=True, nullable=False)
    recipient = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    snippet = Column(Text, nullable=True)
    body_plain = Column(Text, nullable=True)
    internal_date = Column(DateTime, index=True, nullable=False)
    labels = Column(Text, default="[]")  # Stored as JSON string in SQLite
    is_unread = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    has_attachments = Column(Boolean, default=False)
    attachment_count = Column(Integer, default=0)
    list_unsubscribe_url = Column(String, nullable=True)
    category = Column(String, index=True, nullable=True)
    priority_score = Column(Float, default=0.5)
    inserted_at = Column(DateTime, default=datetime.utcnow)

    def get_labels(self) -> list[str]:
        try:
            return json.loads(self.labels) if self.labels else []
        except Exception:
            return []


class ConversationThread(Base):
    __tablename__ = "threads"

    thread_id = Column(String, primary_key=True, index=True)
    subject = Column(String, nullable=True)
    message_count = Column(Integer, default=1)
    first_message_date = Column(DateTime, nullable=False)
    last_message_date = Column(DateTime, index=True, nullable=False)
    participants = Column(Text, default="[]")  # JSON string
    labels = Column(Text, default="[]")        # JSON string
    snippet = Column(Text, nullable=True)
    has_action_item = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

    def get_participants(self) -> list[str]:
        try:
            return json.loads(self.participants) if self.participants else []
        except Exception:
            return []


class ActionItem(Base):
    __tablename__ = "action_items"

    item_id = Column(String, primary_key=True, index=True)
    message_id = Column(String, index=True, nullable=False)
    thread_id = Column(String, index=True, nullable=False)
    task = Column(Text, nullable=False)
    due_date = Column(Date, nullable=True)
    priority = Column(String, default="medium")  # urgent, high, medium, low
    status = Column(String, default="pending")    # pending, completed, dismissed
    detected_sender = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class Subscription(Base):
    __tablename__ = "subscriptions"

    subscription_id = Column(String, primary_key=True, index=True)
    service_name = Column(String, index=True, nullable=False)
    category = Column(String, default="Productivity", index=True)  # Cloud & Infra, Dev Tools, Streaming & Media, Productivity, Newsletters
    sender_email = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    frequency = Column(String, default="monthly")  # monthly, annual, weekly, variable
    payment_method = Column(String, default="Credit Card", nullable=True)
    last_billed_date = Column(Date, nullable=True)
    unsubscribe_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    detected_at = Column(DateTime, default=datetime.utcnow)


class BillingInvoice(Base):
    __tablename__ = "billing_invoices"

    invoice_id = Column(String, primary_key=True, index=True)
    service_name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    invoice_date = Column(Date, index=True, nullable=False)
    payment_method = Column(String, default="Credit Card")
    status = Column(String, default="paid")  # paid, pending, failed
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SyncState(Base):
    __tablename__ = "sync_state"

    id = Column(Integer, primary_key=True, default=1)
    last_history_id = Column(String, nullable=True)
    last_synced_at = Column(DateTime, nullable=True)
    total_messages_synced = Column(Integer, default=0)
    source = Column(String, default="gmail_api")
