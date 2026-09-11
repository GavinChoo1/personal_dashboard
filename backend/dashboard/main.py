import sys
from pathlib import Path

# Ensure project root is in sys.path for direct script execution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.dashboard.config import settings
from backend.dashboard.routers.gcp_dashboard import router as gcp_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gcp_health_cost_api")

app = FastAPI(
    title="Google Cloud Health & Costing API",
    description="Real-time GCP infrastructure telemetry, BigQuery storage inspection, GCS bucket lifecycle, and Always Free Tier billing engine",
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

# Mount GCP Cloud Health & Cost feature router
app.include_router(gcp_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Google Cloud Health & Costing API",
        "gcp_project": settings.gcp_project_id,
        "region": "us-central1",
        "bigquery_dataset": settings.bigquery_dataset,
        "gcs_bucket": settings.gcs_bucket_name,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.dashboard.main:app", host="127.0.0.1", port=8000, reload=True)
