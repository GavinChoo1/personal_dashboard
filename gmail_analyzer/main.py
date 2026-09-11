import sys
from pathlib import Path

# Ensure project root is in sys.path for direct script execution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gmail_analyzer.config import settings
from gmail_analyzer.database import Base, engine
from gmail_analyzer.routers.analytics import router as analytics_router
from gmail_analyzer.routers.emails import router as emails_router
from gmail_analyzer.routers.insights import router as insights_router
from gmail_analyzer.routers.sync import router as sync_router
from gmail_analyzer.routers.costs import router as costs_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gmail_analyzer")

# Initialize SQLite database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gmail Personal Analyzer API",
    description="Analytics, task extraction, and BigQuery warehouse engine for Gmail",
    version="1.0.0",
)

# CORS middleware for modern frontend SPA
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Gmail feature routers
app.include_router(analytics_router)
app.include_router(emails_router)
app.include_router(insights_router)
app.include_router(sync_router)
app.include_router(costs_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Gmail Personal Analyzer API",
        "database": settings.database_url,
        "gcp_project": settings.gcp_project_id,
        "bigquery_dataset": settings.bigquery_dataset,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("gmail_analyzer.main:app", host="127.0.0.1", port=8001, reload=True)
