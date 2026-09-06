from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.services.cost_engine import cost_engine

router = APIRouter(prefix="/api/costs", tags=["costs"])

@router.get("/overview")
def get_cost_overview(db: Session = Depends(get_db)):
    return cost_engine.get_overview(db)

@router.get("/breakdown")
def get_cost_breakdown(db: Session = Depends(get_db)):
    return cost_engine.get_breakdown(db)

@router.get("/timeline")
def get_cost_timeline(db: Session = Depends(get_db)):
    return cost_engine.get_timeline(db)

@router.get("/recommendations")
def get_cost_recommendations(db: Session = Depends(get_db)):
    return cost_engine.get_recommendations(db)

@router.get("/gcp-usage")
def get_gcp_usage(db: Session = Depends(get_db)):
    return cost_engine.get_gcp_and_api_usage(db)
