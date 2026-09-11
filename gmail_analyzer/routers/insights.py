from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from gmail_analyzer.database import get_db
from gmail_analyzer.models import EmailMessage, ActionItem, Subscription
from gmail_analyzer.services.ai_analyzer import ai_analyzer

router = APIRouter(prefix="/api/insights", tags=["insights"])

class AskRequest(BaseModel):
    question: str

@router.get("/digest")
def get_digest(db: Session = Depends(get_db)):
    emails = db.query(EmailMessage).order_by(EmailMessage.internal_date.desc()).limit(30).all()
    actions = db.query(ActionItem).filter(ActionItem.status == "pending").all()
    
    email_dicts = [
        {
            "subject": e.subject,
            "sender_name": e.sender_name,
            "sender_email": e.sender_email,
            "snippet": e.snippet,
            "thread_id": e.thread_id,
            "category": e.category,
            "is_unread": e.is_unread,
        }
        for e in emails
    ]
    
    action_dicts = [
        {"task": a.task, "priority": a.priority, "detected_sender": a.detected_sender}
        for a in actions
    ]
    
    return ai_analyzer.generate_executive_digest(email_dicts, action_dicts)

@router.get("/actions")
def get_actions(status: str = "pending", db: Session = Depends(get_db)):
    query = db.query(ActionItem)
    if status != "all":
        query = query.filter(ActionItem.status == status)
    
    items = query.order_by(ActionItem.created_at.desc()).all()
    return [
        {
            "item_id": a.item_id,
            "message_id": a.message_id,
            "thread_id": a.thread_id,
            "task": a.task,
            "due_date": str(a.due_date) if a.due_date else None,
            "priority": a.priority,
            "status": a.status,
            "detected_sender": a.detected_sender,
            "gmail_link": f"https://mail.google.com/mail/u/0/#all/{a.thread_id}",
        }
        for a in items
    ]

@router.patch("/actions/{item_id}")
def update_action_status(item_id: str, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    # Toggle status
    item.status = "completed" if item.status == "pending" else "pending"
    item.completed_at = datetime.utcnow() if item.status == "completed" else None
    db.commit()
    db.refresh(item)
    return {"status": item.status, "item_id": item.item_id}

@router.get("/subscriptions")
def get_subscriptions(db: Session = Depends(get_db)):
    subs = db.query(Subscription).order_by(Subscription.amount.desc()).all()
    total_monthly = sum(s.amount or 0.0 for s in subs if s.is_active)
    
    return {
        "total_monthly_spend": round(total_monthly, 2),
        "subscriptions": [
            {
                "subscription_id": s.subscription_id,
                "service_name": s.service_name,
                "sender_email": s.sender_email,
                "amount": s.amount,
                "currency": s.currency,
                "frequency": s.frequency,
                "last_billed_date": str(s.last_billed_date) if s.last_billed_date else None,
                "unsubscribe_url": s.unsubscribe_url,
                "is_active": s.is_active,
            }
            for s in subs
        ]
    }

@router.post("/ask")
def ask_inbox_query(req: AskRequest, db: Session = Depends(get_db)):
    emails = db.query(EmailMessage).limit(100).all()
    email_dicts = [
        {
            "subject": e.subject,
            "sender_name": e.sender_name,
            "sender_email": e.sender_email,
            "snippet": e.snippet,
            "body_plain": e.body_plain,
            "thread_id": e.thread_id,
            "internal_date": e.internal_date,
        }
        for e in emails
    ]
    return ai_analyzer.ask_inbox(req.question, email_dicts)
