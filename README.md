# Gmail Intelligence & Personal Warehouse Dashboard

A full-stack personal email analytics, AI task extraction, and cloud warehouse dashboard powered by **FastAPI**, **React + Vite**, **Google Drive External Tables**, and **Google Cloud BigQuery**.

---

## Quick Start: Running the Dashboard

### ⚡ Option A: One-Click Launcher (Recommended)
Simply double-click:
- **`start_dashboard.bat`** (or run `.\start_dashboard.ps1` in PowerShell)

This automatically:
1. Spawns the FastAPI backend server on port 8000.
2. Spawns the Vite frontend dev server on port 5173.
3. Automatically opens your default web browser to [http://localhost:5173](http://localhost:5173).

To stop all services at once, double-click **`stop_dashboard.bat`** (or run `.\stop_dashboard.ps1`).

---

### 🛠️ Option B: Manual Terminal Startup
From the project root:
```powershell
.\backend\.venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Start the Frontend Dashboard (React + Vite)
From a second terminal:
```powershell
cd frontend
npm run dev
```
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)

---

## Features & Workflows

1. **Gmail API 3-Day Ingestion to Google Drive External Tables**:
   - In the dashboard header, click **"Sync 3 Days (Gmail → Drive)"**.
   - Fetches emails from the past 72 hours via the Gmail API (`newer_than:3d`).
   - Writes directly into your Google Drive: `G:\My Drive\personal_dashboard\emails\emails_past_3d.jsonl` and `.parquet`.
   - The dashboard queries this dataset live using high-performance External Tables.

2. **Executive Briefing & AI Digest**:
   - Automated breakdown of top senders, newsletters, financial receipts, and unread priority threads.

3. **Cloud Infrastructure (Terraform)**:
   - Complete Terraform scripts for Google Cloud Storage, BigQuery datasets, and IAM service accounts are located in the [`terraform/`](file:///c:/Users/chooj/Desktop/Github/personal_dashboard/terraform/README.md) directory.
