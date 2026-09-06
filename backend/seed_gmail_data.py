import json
import random
from datetime import datetime, timedelta, date
from backend.database import SessionLocal, Base, engine
from backend.models import EmailMessage, ConversationThread, ActionItem, Subscription, BillingInvoice, SyncState
from backend.services.bigquery_service import bigquery_service
from backend.services.ai_analyzer import ai_analyzer

# Create local tables if needed
Base.metadata.create_all(bind=engine)

SAMPLE_SENDERS = [
    ("Google Cloud Billing", "googlecloud-billing-noreply@google.com", "Finance"),
    ("GitHub Notifications", "notifications@github.com", "Updates"),
    ("Amazon Web Services", "no-reply-aws@amazon.com", "Finance"),
    ("Netflix Support", "info@mailer.netflix.com", "Finance"),
    ("Spotify Premium", "no-reply@spotify.com", "Finance"),
    ("Sarah Jenkins (Product)", "s.jenkins@acmecorp.io", "Primary"),
    ("David Miller (Engineering)", "d.miller@acmecorp.io", "Primary"),
    ("Substack - The Pragmatic Engineer", "pragmatic@substack.com", "Newsletters"),
    ("TLDR Tech Newsletter", "dan@tldr.tech", "Newsletters"),
    ("Singapore Airlines", "kf_enquiry@singaporeair.com.sg", "Updates"),
    ("Stripe Invoicing", "invoices+statements@stripe.com", "Finance"),
    ("Alex Wong (Design Lead)", "a.wong@acmecorp.io", "Primary"),
]

SAMPLE_EMAILS_DATA = [
    {
        "subject": "Invoice: Your Google Cloud statement for personal-dashboard-507703",
        "sender_name": "Google Cloud Billing",
        "sender_email": "googlecloud-billing-noreply@google.com",
        "snippet": "Your monthly Google Cloud Platform invoice is ready. Total charges: $0.00 (within Free Tier allowance).",
        "body_plain": "Hello,\n\nYour monthly statement for project personal-dashboard-507703 is available for download.\nTotal amount: $0.00 USD. You are fully covered under BigQuery and Cloud Storage Free Tier allowances.\nView your billing dashboard: https://console.cloud.google.com/billing",
        "category": "Finance",
        "is_unread": False,
        "is_starred": True,
        "has_attachments": True,
        "attachment_count": 1,
    },
    {
        "subject": "Action Required: Review Q3 Architecture & BigQuery Migration Proposal",
        "sender_name": "David Miller (Engineering)",
        "sender_email": "d.miller@acmecorp.io",
        "snippet": "Hey, could you please review the architecture document for the BigQuery migration by Friday?",
        "body_plain": "Hi team,\n\nI've finalized the RFC draft for our pipeline and warehouse migration to BigQuery.\nPlease review document by Friday EOD and leave comments on the schema partitioning strategy.\nLink: https://docs.acmecorp.io/rfc/bigquery-migration\n\nThanks,\nDavid",
        "category": "Primary",
        "is_unread": True,
        "is_starred": True,
        "has_attachments": False,
        "attachment_count": 0,
    },
    {
        "subject": "Urgent: Final signoff needed on dashboard UI design system",
        "sender_name": "Alex Wong (Design Lead)",
        "sender_email": "a.wong@acmecorp.io",
        "snippet": "We need your signoff on the dark-mode glassmorphic components before we cut the v1 release.",
        "body_plain": "Hey!\n\nCould you please take a look at the updated Figma prototype and confirm if the color tokens and typography match requirements?\nWe need your signoff today ASAP so the frontend team can unblock the release.\n\nFigma link: https://figma.com/file/dashboard-tokens\n\nBest,\nAlex",
        "category": "Primary",
        "is_unread": True,
        "is_starred": True,
        "has_attachments": False,
        "attachment_count": 0,
    },
    {
        "subject": "Your Netflix membership has renewed",
        "sender_name": "Netflix Support",
        "sender_email": "info@mailer.netflix.com",
        "snippet": "Thanks for being a member. Your monthly subscription of $15.49 was charged to your card ending in 4242.",
        "body_plain": "Hi,\n\nWe billed your credit card $15.49 for your Netflix Premium Plan.\nNext billing date: October 5, 2026.\nManage your membership: https://www.netflix.com/youraccount",
        "category": "Finance",
        "is_unread": False,
        "is_starred": False,
        "has_attachments": False,
        "attachment_count": 0,
        "list_unsubscribe_url": "https://www.netflix.com/unsubscribe",
    },
    {
        "subject": "GitHub Copilot Subscription Receipt #GH-90214",
        "sender_name": "GitHub Notifications",
        "sender_email": "notifications@github.com",
        "snippet": "GitHub payment confirmation: $10.00 USD for GitHub Copilot Individual.",
        "body_plain": "Thanks for your payment!\n\nItem: GitHub Copilot Individual\nAmount: $10.00 USD\nPeriod: Sep 5, 2026 - Oct 5, 2026\nManage billing: https://github.com/settings/billing",
        "category": "Finance",
        "is_unread": False,
        "is_starred": False,
        "has_attachments": True,
        "attachment_count": 1,
    },
    {
        "subject": "Your monthly Spotify Premium receipt",
        "sender_name": "Spotify Premium",
        "sender_email": "no-reply@spotify.com",
        "snippet": "Your Spotify Premium Individual subscription was renewed for $10.99.",
        "body_plain": "Receipt from Spotify\nAmount: $10.99\nDate: September 3, 2026\nPayment method: Card ending in 1188\nManage plan: https://spotify.com/account",
        "category": "Finance",
        "is_unread": False,
        "is_starred": False,
        "has_attachments": False,
        "attachment_count": 0,
        "list_unsubscribe_url": "https://spotify.com/unsubscribe",
    },
    {
        "subject": "The Pragmatic Engineer: How big tech companies design data warehouses",
        "sender_name": "Substack - The Pragmatic Engineer",
        "sender_email": "pragmatic@substack.com",
        "snippet": "A deep dive into partition pruning, columnar storage in BigQuery, and real-time streaming architectures.",
        "body_plain": "Issue #184\nToday we break down how top engineering teams structure their analytical layers using BigQuery and dbt.\nKey takeaways:\n1. Partition by timestamp date to avoid full table scans\n2. Cluster high-cardinality keys like user_id and thread_id\n3. Use streaming inserts for real-time dashboards\nRead online: https://newsletter.pragmaticengineer.com/p/data-warehouses",
        "category": "Newsletters",
        "is_unread": True,
        "is_starred": False,
        "has_attachments": False,
        "attachment_count": 0,
        "list_unsubscribe_url": "https://pragmatic.substack.com/action/disable_email",
    },
    {
        "subject": "TLDR Tech: AI Agent Frameworks & High-Performance Data pipelines",
        "sender_name": "TLDR Tech Newsletter",
        "sender_email": "dan@tldr.tech",
        "snippet": "Anthropic, Google Gemini 2.5 benchmarks, and how developers are building autonomous workflows.",
        "body_plain": "TLDR Tech Daily Digest\nHeadlines:\n- Gemini 2.5 Flash sets new standards for multimodal agent tasks\n- Fast BigQuery querying with Python and Arrow serialization\n- React 19 ecosystem adoption update\nUnsubscribe: https://tldr.tech/unsubscribe",
        "category": "Newsletters",
        "is_unread": False,
        "is_starred": False,
        "has_attachments": False,
        "attachment_count": 0,
        "list_unsubscribe_url": "https://tldr.tech/unsubscribe",
    },
    {
        "subject": "Flight Confirmation SQ328: Singapore to San Francisco (E-Ticket)",
        "sender_name": "Singapore Airlines",
        "sender_email": "kf_enquiry@singaporeair.com.sg",
        "snippet": "Booking Reference: 6KQZ9B. Flight SQ328 departs Singapore Changi Terminal 3 at 09:30 AM.",
        "body_plain": "Booking Confirmation\nPassenger: Jianfeng Choo\nFlight: SQ328 (SIN -> SFO)\nDeparture: September 18, 2026, 09:30 SGT\nSeat: 32K (Window)\nBooking Reference: 6KQZ9B\nPlease check in 48 hours before departure online.",
        "category": "Updates",
        "is_unread": False,
        "is_starred": True,
        "has_attachments": True,
        "attachment_count": 1,
    },
    {
        "subject": "Please confirm: Catch up next Tuesday over coffee?",
        "sender_name": "Sarah Jenkins (Product)",
        "sender_email": "s.jenkins@acmecorp.io",
        "snippet": "Are you free around 3pm next Tuesday to catch up on sprint planning?",
        "body_plain": "Hey,\n\nLong time no chat! Do you have 20 minutes next Tuesday around 3:00 PM for a quick sync on the roadmap?\nLet me know what works for you.\n\nSarah",
        "category": "Primary",
        "is_unread": True,
        "is_starred": False,
        "has_attachments": False,
        "attachment_count": 0,
    },
    {
        "subject": "AWS Billing Notification: August 2026 Invoice Available",
        "sender_name": "Amazon Web Services",
        "sender_email": "no-reply-aws@amazon.com",
        "snippet": "Your AWS bill for account 9912-3481 is ready. Total charges: $28.50 USD.",
        "body_plain": "Dear AWS Customer,\n\nYour bill for the billing period August 1 - August 31, 2026 is now available.\nAmount: $28.50\nPayment Method: Automatic debit via card ending in 4242.\nView details in the AWS Billing Console.",
        "category": "Finance",
        "is_unread": False,
        "is_starred": False,
        "has_attachments": True,
        "attachment_count": 1,
    }
]

def seed_database():
    db = SessionLocal()
    print("Clearing old local data...")
    db.query(BillingInvoice).delete()
    db.query(ActionItem).delete()
    db.query(Subscription).delete()
    db.query(EmailMessage).delete()
    db.query(ConversationThread).delete()
    db.commit()

    all_messages_dicts = []
    threads_map = {}

    print(f"Generating realistic emails across {len(SAMPLE_EMAILS_DATA)} base scenarios...")

    # Generate 50 realistic emails by expanding the scenarios over the past 30 days
    now = datetime.utcnow()
    
    for i in range(50):
        base_item = SAMPLE_EMAILS_DATA[i % len(SAMPLE_EMAILS_DATA)]
        days_ago = (i * 7) % 30
        hours_ago = (i * 3) % 24
        msg_date = now - timedelta(days=days_ago, hours=hours_ago, minutes=(i * 13) % 60)
        
        msg_hex = f"{random.randint(0x1000000000000000, 0x1fffffffffffffff):016x}"
        thread_hex = f"{random.randint(0x1000000000000000, 0x1fffffffffffffff):016x}"
        
        msg_id = f"18df{msg_hex[4:]}"
        thread_id = f"18df{thread_hex[4:]}"
        
        subject = base_item["subject"]
        if i >= len(SAMPLE_EMAILS_DATA):
            subject = f"{subject} [Update #{i // len(SAMPLE_EMAILS_DATA)}]"

        labels = ["INBOX"]
        if base_item["is_unread"]:
            labels.append("UNREAD")
        if base_item["is_starred"]:
            labels.append("STARRED")
        labels.append(f"CATEGORY_{base_item['category'].upper()}")

        msg_dict = {
            "message_id": msg_id,
            "thread_id": thread_id,
            "sender_name": base_item["sender_name"],
            "sender_email": base_item["sender_email"],
            "recipient": "choojianfeng@gmail.com",
            "subject": subject,
            "snippet": base_item["snippet"],
            "body_plain": base_item["body_plain"],
            "internal_date": msg_date,
            "labels": labels,
            "is_unread": base_item["is_unread"] if i < len(SAMPLE_EMAILS_DATA) else (i % 3 == 0),
            "is_starred": base_item["is_starred"],
            "has_attachments": base_item["has_attachments"],
            "attachment_count": base_item["attachment_count"],
            "list_unsubscribe_url": base_item.get("list_unsubscribe_url"),
            "category": base_item["category"],
            "priority_score": 0.9 if "urgent" in subject.lower() or "action" in subject.lower() else 0.4,
            "inserted_at": now,
        }
        all_messages_dicts.append(msg_dict)

        # Local SQLite insert
        db_msg = EmailMessage(
            message_id=msg_dict["message_id"],
            thread_id=msg_dict["thread_id"],
            sender_name=msg_dict["sender_name"],
            sender_email=msg_dict["sender_email"],
            recipient=msg_dict["recipient"],
            subject=msg_dict["subject"],
            snippet=msg_dict["snippet"],
            body_plain=msg_dict["body_plain"],
            internal_date=msg_dict["internal_date"],
            labels=json.dumps(msg_dict["labels"]),
            is_unread=msg_dict["is_unread"],
            is_starred=msg_dict["is_starred"],
            has_attachments=msg_dict["has_attachments"],
            attachment_count=msg_dict["attachment_count"],
            list_unsubscribe_url=msg_dict["list_unsubscribe_url"],
            category=msg_dict["category"],
            priority_score=msg_dict["priority_score"],
            inserted_at=msg_dict["inserted_at"],
        )
        db.add(db_msg)

        # Aggregate threads
        if thread_id not in threads_map:
            threads_map[thread_id] = {
                "thread_id": thread_id,
                "subject": subject,
                "message_count": 1,
                "first_message_date": msg_date,
                "last_message_date": msg_date,
                "participants": [msg_dict["sender_email"]],
                "labels": labels,
                "snippet": msg_dict["snippet"],
                "has_action_item": False,
            }
        else:
            threads_map[thread_id]["message_count"] += 1

    # Insert action items
    print("Extracting AI action items from messages...")
    action_items = ai_analyzer.extract_action_items(all_messages_dicts)
    for act in action_items:
        db_act = ActionItem(
            item_id=act["item_id"],
            message_id=act["message_id"],
            thread_id=act["thread_id"],
            task=act["task"],
            due_date=date.today() + timedelta(days=2),
            priority=act["priority"],
            status=act["status"],
            detected_sender=act["detected_sender"],
            created_at=datetime.utcnow(),
        )
        db.add(db_act)

    # Insert subscriptions & detailed cost history
    print("Detecting subscriptions and recurring bills...")
    subs = ai_analyzer.detect_subscriptions(all_messages_dicts)
    
    # Metadata map for categories and payment methods
    meta_map = {
        "Netflix": {"category": "Streaming & Entertainment", "pm": "Visa •••• 4242"},
        "Spotify": {"category": "Streaming & Entertainment", "pm": "Mastercard •••• 1188"},
        "GitHub Copilot": {"category": "Developer Tools & AI", "pm": "Visa •••• 4242"},
        "Amazon Web Services": {"category": "Cloud & Infrastructure", "pm": "Amex •••• 9912"},
        "Google Cloud Platform": {"category": "Cloud & Infrastructure", "pm": "Mastercard •••• 8821"},
        "OpenAI / ChatGPT Plus": {"category": "Developer Tools & AI", "pm": "Visa •••• 4242"},
        "Substack Publication": {"category": "Newsletters & Media", "pm": "Visa •••• 4242"},
    }

    # Ensure rich service portfolio
    extra_services = [
        {"name": "OpenAI / ChatGPT Plus", "cat": "Developer Tools & AI", "amt": 20.00, "pm": "Visa •••• 4242", "email": "billing@openai.com", "url": "https://chatgpt.com/#settings/subscription"}
    ]

    for extra in extra_services:
        if not any(s["service_name"] == extra["name"] for s in subs):
            subs.append({
                "subscription_id": f"sub_{extra['name'].lower().replace(' ', '_').replace('/', '_')}",
                "service_name": extra["name"],
                "sender_email": extra["email"],
                "amount": extra["amt"],
                "currency": "USD",
                "frequency": "monthly",
                "unsubscribe_url": extra["url"],
                "is_active": True,
            })

    # Save subscriptions and generate 6 months of historical invoices
    today = date.today()
    for s in subs:
        s_name = s["service_name"]
        meta = meta_map.get(s_name, {"category": "Productivity & Work", "pm": "Visa •••• 4242"})
        
        db_sub = Subscription(
            subscription_id=s["subscription_id"],
            service_name=s_name,
            category=meta["category"],
            sender_email=s["sender_email"],
            amount=s["amount"],
            currency=s["currency"],
            frequency=s["frequency"],
            payment_method=meta["pm"],
            last_billed_date=today - timedelta(days=2),
            unsubscribe_url=s["unsubscribe_url"],
            is_active=s["is_active"],
            detected_at=datetime.utcnow(),
        )
        db.add(db_sub)

        # Generate 6 months of invoices (e.g. from March 2026 to August 2026)
        for m_offset in range(5, -1, -1):
            inv_date = (today - timedelta(days=m_offset * 30)).replace(day=random.randint(1, 5))
            db_inv = BillingInvoice(
                invoice_id=f"inv_{s['subscription_id']}_{m_offset}",
                service_name=s_name,
                category=meta["category"],
                amount=float(s["amount"] or 0.0),
                currency=s["currency"],
                invoice_date=inv_date,
                payment_method=meta["pm"],
                status="paid",
                notes=f"Monthly recurring charge for {s_name}",
                created_at=datetime.utcnow(),
            )
            db.add(db_inv)

    # Insert threads into SQLite
    for t in threads_map.values():
        db_thread = ConversationThread(
            thread_id=t["thread_id"],
            subject=t["subject"],
            message_count=t["message_count"],
            first_message_date=t["first_message_date"],
            last_message_date=t["last_message_date"],
            participants=json.dumps(t["participants"]),
            labels=json.dumps(t["labels"]),
            snippet=t["snippet"],
            has_action_item=t["has_action_item"],
            updated_at=datetime.utcnow(),
        )
        db.add(db_thread)

    db.commit()
    print(f"Local SQLite database seeded with {len(all_messages_dicts)} messages, {len(action_items)} action items, and {len(subs)} subscriptions.")

    # Now stream directly to BigQuery!
    print("Connecting to Google BigQuery in personal-dashboard-507703...")
    if bigquery_service.is_connected():
        print("Streaming messages to BigQuery table: gmail_analyzer.messages ...")
        success = bigquery_service.insert_messages(all_messages_dicts)
        if success:
            print("Successfully streamed 50 historical emails to Google BigQuery!")
        else:
            print("Note: Streaming insert to BigQuery encountered an error or was skipped.")
    else:
        print("BigQuery not reached; local SQLite cache is fully operational.")

    db.close()

def clear_all_data():
    """
    Purges all mock and sample data from the local database.
    """
    db = SessionLocal()
    try:
        db.query(BillingInvoice).delete()
        db.query(Subscription).delete()
        db.query(ActionItem).delete()
        db.query(ConversationThread).delete()
        db.query(EmailMessage).delete()
        db.query(SyncState).delete()
        db.commit()
        print("Successfully wiped all database records.")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
