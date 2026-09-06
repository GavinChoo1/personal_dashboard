import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import Base, engine
from backend.routers.analytics import router as analytics_router
from backend.routers.emails import router as emails_router
from backend.routers.insights import router as insights_router
from backend.routers.sync import router as sync_router
from backend.routers.costs import router as costs_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gmail_analyzer")

# Initialize database schema
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

# Mount feature routers
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
        "gcp_project": settings.gcp_project_id,
        "bigquery_dataset": settings.bigquery_dataset,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
