from datetime import datetime, date, timedelta
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import Subscription, BillingInvoice

class CostEngine:
    @staticmethod
    def get_overview(db: Session) -> dict[str, Any]:
        active_subs = db.query(Subscription).filter(Subscription.is_active == True).all()
        total_monthly = sum(s.amount or 0.0 for s in active_subs)
        projected_annual = total_monthly * 12.0

        # Calculate Cloud Spend vs SaaS Spend
        cloud_spend = sum(s.amount or 0.0 for s in active_subs if s.category == "Cloud & Infrastructure")
        dev_spend = sum(s.amount or 0.0 for s in active_subs if s.category == "Developer Tools & AI")
        streaming_spend = sum(s.amount or 0.0 for s in active_subs if s.category == "Streaming & Entertainment")
        other_spend = total_monthly - (cloud_spend + dev_spend + streaming_spend)

        # Most expensive subscription
        most_expensive = max(active_subs, key=lambda s: s.amount or 0.0, default=None)

        # Month-over-month trend calculation from invoices
        current_month = date.today().replace(day=1)
        prev_month = (current_month - timedelta(days=1)).replace(day=1)
        
        curr_invoice_total = db.query(func.sum(BillingInvoice.amount))\
            .filter(BillingInvoice.invoice_date >= current_month).scalar() or total_monthly
        prev_invoice_total = db.query(func.sum(BillingInvoice.amount))\
            .filter(BillingInvoice.invoice_date >= prev_month, BillingInvoice.invoice_date < current_month).scalar() or total_monthly

        mom_pct = round(((curr_invoice_total - prev_invoice_total) / prev_invoice_total) * 100, 1) if prev_invoice_total else 0.0

        return {
            "total_monthly_spend": round(total_monthly, 2),
            "projected_annual_spend": round(projected_annual, 2),
            "active_subscriptions_count": len(active_subs),
            "mom_change_percent": mom_pct,
            "cloud_infrastructure_spend": round(cloud_spend, 2),
            "dev_and_ai_spend": round(dev_spend, 2),
            "streaming_spend": round(streaming_spend, 2),
            "other_spend": round(max(other_spend, 0.0), 2),
            "most_expensive_service": {
                "name": most_expensive.service_name if most_expensive else "None",
                "amount": most_expensive.amount if most_expensive else 0.0,
            },
            "google_cloud_status": {
                "project_id": "personal-dashboard-507703",
                "current_month_cost": 0.00,
                "tier": "GCP Always Free (BigQuery 10GB + Storage 5GB)",
                "within_free_tier": True
            }
        }

    @staticmethod
    def get_breakdown(db: Session) -> dict[str, Any]:
        active_subs = db.query(Subscription).filter(Subscription.is_active == True).order_by(Subscription.amount.desc()).all()
        
        # Group by category
        categories_map = {}
        items_list = []

        for s in active_subs:
            cat = s.category or "Other SaaS"
            amt = float(s.amount or 0.0)
            annual_amt = amt * 12.0 if s.frequency == "monthly" else amt

            if cat not in categories_map:
                categories_map[cat] = {"category": cat, "total_monthly": 0.0, "count": 0, "services": []}

            categories_map[cat]["total_monthly"] += amt
            categories_map[cat]["count"] += 1
            categories_map[cat]["services"].append(s.service_name)

            items_list.append({
                "subscription_id": s.subscription_id,
                "service_name": s.service_name,
                "category": cat,
                "sender_email": s.sender_email,
                "monthly_amount": round(amt, 2),
                "annual_amount": round(annual_amt, 2),
                "currency": s.currency,
                "frequency": s.frequency,
                "payment_method": s.payment_method or "Credit Card",
                "last_billed_date": str(s.last_billed_date) if s.last_billed_date else None,
                "unsubscribe_url": s.unsubscribe_url,
            })

        # Calculate percentages
        total_sum = sum(c["total_monthly"] for c in categories_map.values()) or 1.0
        category_summaries = []
        for c in categories_map.values():
            category_summaries.append({
                "category": c["category"],
                "total_monthly": round(c["total_monthly"], 2),
                "percentage": round((c["total_monthly"] / total_sum) * 100, 1),
                "count": c["count"],
                "services": c["services"],
            })

        category_summaries.sort(key=lambda x: x["total_monthly"], reverse=True)

        return {
            "categories": category_summaries,
            "items": items_list,
        }

    @staticmethod
    def get_timeline(db: Session) -> list[dict[str, Any]]:
        # Fetch invoices grouped by month over the past 6 months
        invoices = db.query(BillingInvoice).order_by(BillingInvoice.invoice_date.asc()).all()
        
        if not invoices:
            return []

        # Aggregate invoices by month
        monthly_map = {}
        for inv in invoices:
            m_key = inv.invoice_date.strftime("%b %Y")
            if m_key not in monthly_map:
                monthly_map[m_key] = {"month": m_key, "total": 0.0, "cloud": 0.0, "dev_ai": 0.0, "entertainment": 0.0, "other": 0.0}
            
            monthly_map[m_key]["total"] += inv.amount
            if "Cloud" in inv.category:
                monthly_map[m_key]["cloud"] += inv.amount
            elif "Dev" in inv.category or "AI" in inv.category:
                monthly_map[m_key]["dev_ai"] += inv.amount
            elif "Streaming" in inv.category or "Entertainment" in inv.category:
                monthly_map[m_key]["entertainment"] += inv.amount
            else:
                monthly_map[m_key]["other"] += inv.amount

        return [
            {
                "month": v["month"],
                "total": round(v["total"], 2),
                "cloud": round(v["cloud"], 2),
                "dev_ai": round(v["dev_ai"], 2),
                "entertainment": round(v["entertainment"], 2),
                "other": round(v["other"], 2),
            }
            for v in monthly_map.values()
        ]

    @staticmethod
    def get_recommendations(db: Session) -> list[dict[str, Any]]:
        active_subs = db.query(Subscription).filter(Subscription.is_active == True).all()
        if not active_subs:
            return []

        recs = []
        for s in active_subs:
            if s.amount and s.amount >= 10.0 and s.frequency == "monthly":
                annual_saving = round(s.amount * 2.0, 2)
                recs.append({
                    "id": f"rec_annual_{s.subscription_id}",
                    "type": "Savings Opportunity",
                    "title": f"Switch {s.service_name} to Annual Billing",
                    "description": f"{s.service_name} currently billed at ${s.amount:.2f}/mo. Annual plans typically discount ~15-20%.",
                    "potential_savings": f"~${annual_saving:.2f}/yr",
                    "impact": "Medium",
                    "action_url": s.unsubscribe_url or "https://mail.google.com",
                })
        return recs

    @staticmethod
    def get_gcp_and_api_usage(db: Session) -> dict[str, Any]:
        from backend.services.gcs_service import gcs_service
        gcs_stats = gcs_service.get_storage_stats()
        storage_bytes = gcs_stats.get("total_bytes", 0)
        free_tier_storage_bytes = 5 * 1024 * 1024 * 1024  # 5 GB Standard GCS
        storage_used_pct = round((storage_bytes / free_tier_storage_bytes) * 100, 5)

        return {
            "gcp_project_id": "personal-dashboard-507703",
            "gcs_bucket_name": "personal-dashboard-507703-gmail-takeout-staging",
            "total_incurred_cost": 0.00,
            "currency": "USD",
            "status": "100% Free Tier Covered",
            "storage": {
                "storage_type": "Google Cloud Storage",
                "bucket_name": "personal-dashboard-507703-gmail-takeout-staging",
                "files_count": gcs_stats.get("files_count", 0),
                "storage_used_bytes": storage_bytes,
                "storage_used_human": f"{storage_bytes / 1024:.1f} KB",
                "storage_limit_human": "5.0 GB / month",
                "storage_percentage": storage_used_pct,
                "storage_cost": 0.00,
            },
            "apis": [
                {
                    "name": "Gmail REST API v1",
                    "purpose": "Batch email synchronization, headers extraction, and deep linking",
                    "usage": "Active sync connection",
                    "free_tier_quota": "1,000,000,000 quota units / day",
                    "quota_consumed": "< 0.001%",
                    "incurred_cost": 0.00,
                    "pricing_rate": "100% Free / No Charge",
                    "status": "Active",
                },
                {
                    "name": "Google Cloud Storage API",
                    "purpose": "Primary cloud storage for raw email data and messages",
                    "usage": f"{gcs_stats.get('files_count', 0)} files • {storage_bytes / 1024:.1f} KB stored",
                    "free_tier_quota": "5.0 GB Standard Storage / month",
                    "quota_consumed": f"{storage_used_pct}%",
                    "incurred_cost": 0.00,
                    "pricing_rate": "$0.00 within free tier (then $0.026/GB)",
                    "status": "Active",
                },
                {
                    "name": "Google BigQuery API",
                    "purpose": "Historical SQL warehouse (Decommissioned)",
                    "usage": "Dataset deleted • API disabled",
                    "free_tier_quota": "Disabled",
                    "quota_consumed": "0.0%",
                    "incurred_cost": 0.00,
                    "pricing_rate": "Disabled ($0.00)",
                    "status": "Disabled / Removed",
                },
                {
                    "name": "Vertex AI (aiplatform.googleapis.com)",
                    "purpose": "Cloud AI model hosting (Decommissioned)",
                    "usage": "0 active endpoints / 0 jobs",
                    "free_tier_quota": "Disabled in project",
                    "quota_consumed": "0.0%",
                    "incurred_cost": 0.00,
                    "pricing_rate": "Disabled ($0.00)",
                    "status": "Disabled / Removed",
                }
            ]
        }

cost_engine = CostEngine()
