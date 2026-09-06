from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import EmailMessage, SyncState
from backend.services.gcs_service import gcs_service
from backend.services.gmail_service import gmail_service
from backend.services.external_table_service import external_table_service
from backend.config import settings

router = APIRouter(prefix="/api/sync", tags=["sync"])

@router.get("/status")
def get_sync_status(db: Session = Depends(get_db)):
    is_gcs_connected = gcs_service.is_connected()
    local_count = db.query(EmailMessage).count()
    sync_record = db.query(SyncState).first()
    gcs_stats = gcs_service.get_storage_stats()
    ext_status = external_table_service.get_status()

    storage_mode = "Google Cloud Storage + Local Cache" if is_gcs_connected else "Local SQLite Cache"
    if ext_status.get("exists") and ext_status.get("record_count", 0) > 0:
        storage_mode = "Google Drive External Table (NDJSON & Parquet)"

    return {
        "status": "ready",
        "gcp_project_id": settings.gcp_project_id,
        "gcs_bucket_name": settings.gcs_bucket_name,
        "is_gcs_connected": is_gcs_connected,
        "storage_mode": storage_mode,
        "gcs_files_count": gcs_stats.get("files_count", 0),
        "total_messages_indexed": ext_status.get("record_count") if ext_status.get("exists") else local_count,
        "last_synced_at": ext_status.get("last_modified") or (sync_record.last_synced_at.isoformat() if sync_record and sync_record.last_synced_at else None),
        "external_table": ext_status,
        "gmail_api_authenticated": gmail_service.is_authenticated(),
    }

@router.get("/external-table")
def get_external_table_status():
    return external_table_service.get_status()

@router.post("/gmail-drive")
def sync_gmail_to_drive(db: Session = Depends(get_db)):
    """
    Fetches past 3 days of emails from Gmail and loads them into Google Drive external table.
    """
    try:
        messages, is_live, msg = gmail_service.fetch_past_3_days()
        success, file_path, count = external_table_service.write_emails(messages)

        if not success:
            return {
                "success": False,
                "error": f"Failed writing to Google Drive: {file_path}",
                "is_live_api": is_live,
            }

        # Update sync record in DB
        sync_record = db.query(SyncState).first()
        if not sync_record:
            sync_record = SyncState(
                last_history_id="drive_ext_table",
                total_messages_synced=count,
                last_synced_at=datetime.utcnow(),
            )
            db.add(sync_record)
        else:
            sync_record.last_synced_at = datetime.utcnow()
            sync_record.total_messages_synced = count
        db.commit()

        return {
            "success": True,
            "message": msg,
            "is_live_api": is_live,
            "count": count,
            "file_path": file_path,
            "external_table": external_table_service.get_status(),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/clear")
def clear_data():
    from backend.seed_gmail_data import clear_all_data
    try:
        clear_all_data()
        # Remove Google Drive external table mock files if present
        ext_file = settings.external_table_path
        if ext_file.exists():
            ext_file.unlink(missing_ok=True)
        parquet_file = ext_file.parent / "emails_past_3d.parquet"
        if parquet_file.exists():
            parquet_file.unlink(missing_ok=True)

        return {"success": True, "message": "All mock and test data removed successfully."}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/seed")
def trigger_seed():
    from backend.seed_gmail_data import seed_database
    try:
        seed_database()
        return {"success": True, "message": "Successfully generated sample Gmail dataset and streamed to BigQuery!"}
    except Exception as e:
        return {"success": False, "error": str(e)}
