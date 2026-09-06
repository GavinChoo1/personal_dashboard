from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models import EmailMessage, ConversationThread
from backend.services.external_table_service import external_table_service

router = APIRouter(prefix="/api/emails", tags=["emails"])

@router.get("")
def list_emails(
    category: Optional[str] = None,
    unread_only: bool = False,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 25,
    db: Session = Depends(get_db)
):
    # Check Google Drive External Table first
    ext_status = external_table_service.get_status()
    if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
        return external_table_service.query_emails(
            category=category,
            unread_only=unread_only,
            search=search,
            skip=skip,
            limit=limit,
        )

    query = db.query(EmailMessage)
    
    if category and category != "All":
        query = query.filter(EmailMessage.category == category)
    
    if unread_only:
        query = query.filter(EmailMessage.is_unread == True)
        
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                EmailMessage.subject.ilike(search_fmt),
                EmailMessage.snippet.ilike(search_fmt),
                EmailMessage.sender_name.ilike(search_fmt),
                EmailMessage.sender_email.ilike(search_fmt)
            )
        )
        
    total = query.count()
    items = query.order_by(EmailMessage.internal_date.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "message_id": e.message_id,
                "thread_id": e.thread_id,
                "sender_name": e.sender_name,
                "sender_email": e.sender_email,
                "subject": e.subject,
                "snippet": e.snippet,
                "internal_date": e.internal_date.isoformat(),
                "category": e.category,
                "is_unread": e.is_unread,
                "is_starred": e.is_starred,
                "has_attachments": e.has_attachments,
                "priority_score": e.priority_score,
                "gmail_link": f"https://mail.google.com/mail/u/0/#all/{e.thread_id}",
            }
            for e in items
        ]
    }

@router.get("/{message_id}")
def get_email_detail(message_id: str, db: Session = Depends(get_db)):
    # Check External Table
    ext_status = external_table_service.get_status()
    if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
        ext_res = external_table_service.query_emails(limit=100)
        for item in ext_res.get("items", []):
            if item.get("message_id") == message_id:
                return item

    email = db.query(EmailMessage).filter(EmailMessage.message_id == message_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return {
        "message_id": email.message_id,
        "thread_id": email.thread_id,
        "sender_name": email.sender_name,
        "sender_email": email.sender_email,
        "recipient": email.recipient,
        "subject": email.subject,
        "snippet": email.snippet,
        "body_plain": email.body_plain,
        "internal_date": email.internal_date.isoformat(),
        "labels": email.get_labels(),
        "is_unread": email.is_unread,
        "is_starred": email.is_starred,
        "has_attachments": email.has_attachments,
        "category": email.category,
        "list_unsubscribe_url": email.list_unsubscribe_url,
        "gmail_link": f"https://mail.google.com/mail/u/0/#all/{email.thread_id}",
    }
