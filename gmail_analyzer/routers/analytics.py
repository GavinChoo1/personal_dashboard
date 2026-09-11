from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from gmail_analyzer.database import get_db
from gmail_analyzer.services.stats_engine import stats_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    return stats_engine.get_overview(db)

@router.get("/top-senders")
def get_top_senders(limit: int = 8, db: Session = Depends(get_db)):
    return stats_engine.get_top_senders(db, limit)

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return stats_engine.get_category_distribution(db)

@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    return stats_engine.get_volume_trends(db)
