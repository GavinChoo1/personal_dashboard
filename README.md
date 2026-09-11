# Gmail Intelligence & Personal Warehouse Dashboard

A full-stack personal email analytics, AI task extraction, and cloud warehouse dashboard powered by **FastAPI**, **React + Vite + Tailwind CSS v4**, **Google Drive External Tables**, and **Google Cloud BigQuery**.

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Gmail REST API v1      │
                          └─────────────┬────────────┘
                                        │ (Sync 3 Days)
                                        ▼
                          ┌──────────────────────────┐
                          │   Google Drive / GCS     │
                          │   (NDJSON External Table)│
                          └─────────────┬────────────┘
                                        │
┌─────────────────────────┐             │             ┌─────────────────────────┐
│  React + Tailwind v4    │◄────────────┼────────────►│  FastAPI Backend        │
│  (Port 5173, Vite SPA)  │  REST API   │  Port 8000  │  (Python 3.14 + venv)   │
└─────────────────────────┘             │             └─────────────┬───────────┘
                                        ▼                           │
                          ┌──────────────────────────┐              │
                          │  Google Cloud BigQuery   │◄─────────────┘
                          │  (messages, threads,     │ (Historical Streaming
                          │   actions, subscriptions)│  & SQL Analytics)
                          └──────────────────────────┘
```

---

## Quick Start: Running the Dashboard

### ⚡ All-in-One Launcher (Recommended)
From the project root in PowerShell:
```powershell
.\dashboard.ps1
```

This single command automatically:
1. Clears any stale port conflicts on ports 8000 and 5173.
2. Spawns the FastAPI backend server on [http://localhost:8000](http://localhost:8000).
3. Spawns the Vite + Tailwind CSS v4 frontend on [http://localhost:5173](http://localhost:5173).
4. Opens your default web browser to [http://localhost:5173](http://localhost:5173).
5. Monitors the running services. Simply press **`Q`** to stop all services and exit.

To stop running services at any time from another terminal:
```powershell
.\dashboard.ps1 -Stop
```

---

### 🛠️ Option B: Manual Terminal Startup

#### 1. Start the FastAPI Backend
From the project root:
```powershell
.\backend\.venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### 2. Start the Frontend Dashboard (React + Tailwind CSS v4)
From a second terminal:
```powershell
cd frontend
npm run dev
```
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)

---

## Features & Workflows

1. **Executive Briefing & Daily Digest**:
   - Automated breakdown of top senders, newsletters, financial receipts, and unread priority threads.
2. **Cost Intelligence & Free Tier Monitor**:
   - Live tracking of Google Cloud Storage and BigQuery usage against GCP's Always Free Tier limits.
   - SaaS subscription and invoice register with potential savings recommendations.
3. **Action Items & Commitments**:
   - Tasks and follow-up deadlines extracted from email conversations with priority classification (`High`, `Medium`, `Low`).
4. **Gmail API 3-Day Ingestion to Drive External Tables**:
   - In the dashboard header, click **"Sync 3 Days (Gmail → Drive)"**.
   - Fetches emails from the past 72 hours via the Gmail API (`newer_than:3d`).
   - Writes directly into your Google Drive: `G:\My Drive\personal_dashboard\emails\emails_past_3d.jsonl`.
5. **Cloud Infrastructure (Terraform & CI/CD)**:
   - All-in-one Terraform configuration is located in the [backend/terraform/](backend/terraform/README.md) directory.
   - Automated GitHub Actions CI/CD workflow configured in [.github/workflows/terraform.yml](.github/workflows/terraform.yml).
