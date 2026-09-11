from datetime import datetime
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from gmail_analyzer.models import EmailMessage, ConversationThread, ActionItem, Subscription
from backend.dashboard.services.bigquery_service import bigquery_service
from gmail_analyzer.services.external_table_service import external_table_service

class StatsEngine:
    @staticmethod
    def get_overview(db: Session) -> dict[str, Any]:
        # 1. Try Google Drive External Table first
        ext_status = external_table_service.get_status()
        if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
            ext_stats = external_table_service.query_overview()
            if ext_stats:
                action_items_pending = db.query(ActionItem).filter(ActionItem.status == "pending").count()
                active_subs = db.query(Subscription).filter(Subscription.is_active == True).all()
                total_sub_cost = sum(s.amount or 0.0 for s in active_subs)
                ext_stats["pending_action_items"] = action_items_pending
                ext_stats["active_subscriptions_count"] = len(active_subs)
                ext_stats["monthly_subscription_spend"] = round(total_sub_cost, 2)
                ext_stats["is_bigquery"] = False
                return ext_stats

        # 2. Try BigQuery
        if bigquery_service.is_connected():
            bq_stats = bigquery_service.query_overview_stats()
            if bq_stats and bq_stats.get("total_messages", 0) > 0:
                # Augment with local action items & subscriptions
                action_items_pending = db.query(ActionItem).filter(ActionItem.status == "pending").count()
                active_subs = db.query(Subscription).filter(Subscription.is_active == True).all()
                total_sub_cost = sum(s.amount or 0.0 for s in active_subs)

                return {
                    "source": "BigQuery (Google Cloud)",
                    "is_bigquery": True,
                    "is_external_table": False,
                    "total_messages": bq_stats["total_messages"],
                    "unread_messages": bq_stats["unread_messages"],
                    "total_unique_senders": bq_stats["total_unique_senders"],
                    "pending_action_items": action_items_pending,
                    "active_subscriptions_count": len(active_subs),
                    "monthly_subscription_spend": round(total_sub_cost, 2),
                    "newsletter_clutter_count": bq_stats["newsletter_count"] + bq_stats["promotional_count"],
                    "date_range": {
                        "earliest": bq_stats.get("earliest_date"),
                        "latest": bq_stats.get("latest_date"),
                    }
                }

        # Fallback to local SQLite cache
        total = db.query(EmailMessage).count()
        unread = db.query(EmailMessage).filter(EmailMessage.is_unread == True).count()
        unique_senders = db.query(func.count(func.distinct(EmailMessage.sender_email))).scalar() or 0
        action_items_pending = db.query(ActionItem).filter(ActionItem.status == "pending").count()
        active_subs = db.query(Subscription).filter(Subscription.is_active == True).all()
        total_sub_cost = sum(s.amount or 0.0 for s in active_subs)
        clutter = db.query(EmailMessage).filter(EmailMessage.category.in_(["Promotions", "Newsletters"])).count()

        earliest = db.query(func.min(EmailMessage.internal_date)).scalar()
        latest = db.query(func.max(EmailMessage.internal_date)).scalar()

        return {
            "source": "Local SQLite Cache",
            "is_bigquery": False,
            "total_messages": total,
            "unread_messages": unread,
            "total_unique_senders": unique_senders,
            "pending_action_items": action_items_pending,
            "active_subscriptions_count": len(active_subs),
            "monthly_subscription_spend": round(total_sub_cost, 2),
            "newsletter_clutter_count": clutter,
            "date_range": {
                "earliest": earliest.strftime("%Y-%m-%d") if earliest else None,
                "latest": latest.strftime("%Y-%m-%d") if latest else None,
            }
        }

    @staticmethod
    def get_top_senders(db: Session, limit: int = 8) -> list[dict[str, Any]]:
        ext_status = external_table_service.get_status()
        if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
            ext_senders = external_table_service.query_top_senders(limit)
            if ext_senders:
                return ext_senders

        if bigquery_service.is_connected():
            bq_senders = bigquery_service.query_top_senders(limit)
            if bq_senders:
                return bq_senders

        # Fallback
        results = db.query(
            EmailMessage.sender_email,
            EmailMessage.sender_name,
            func.count(EmailMessage.message_id).label("count"),
            func.sum(func.case((EmailMessage.is_unread == True, 1), else_=0)).label("unread_count"),
            EmailMessage.category
        ).group_by(EmailMessage.sender_email).order_by(func.count(EmailMessage.message_id).desc()).limit(limit).all()

        return [
            {
                "sender_email": r[0],
                "sender_name": r[1] or r[0].split("@")[0],
                "message_count": r[2],
                "unread_count": r[3] or 0,
                "primary_category": r[4] or "Other"
            }
            for r in results
        ]

    @staticmethod
    def get_category_distribution(db: Session) -> list[dict[str, Any]]:
        ext_status = external_table_service.get_status()
        if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
            ext_cats = external_table_service.query_category_distribution()
            if ext_cats:
                return ext_cats

        if bigquery_service.is_connected():
            bq_cats = bigquery_service.query_category_distribution()
            if bq_cats:
                return bq_cats

        results = db.query(
            EmailMessage.category,
            func.count(EmailMessage.message_id).label("count")
        ).group_by(EmailMessage.category).order_by(func.count(EmailMessage.message_id).desc()).all()

        return [{"category": r[0] or "Other", "count": r[1]} for r in results]

    @staticmethod
    def get_volume_trends(db: Session) -> list[dict[str, Any]]:
        ext_status = external_table_service.get_status()
        if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
            ext_trends = external_table_service.query_volume_trends()
            if ext_trends:
                return ext_trends

        if bigquery_service.is_connected():
            bq_trends = bigquery_service.query_volume_trends()
            if bq_trends:
                return bq_trends

        results = db.query(
            func.date(EmailMessage.internal_date).label("date"),
            func.count(EmailMessage.message_id).label("count"),
            func.sum(func.case((EmailMessage.is_unread == True, 1), else_=0)).label("unread_count")
        ).group_by(func.date(EmailMessage.internal_date)).order_by(func.date(EmailMessage.internal_date).asc()).limit(30).all()

        return [
            {"date": str(r[0]), "count": r[1], "unread_count": r[2] or 0}
            for r in results
        ]

stats_engine = StatsEngine()
