# Google Cloud Infrastructure with Terraform

This directory contains Terraform code to automatically provision all required Google Cloud infrastructure for the **Gmail Personal Analyzer**:
- **Google Cloud APIs**:
  - `bigquery.googleapis.com` (BigQuery Data Warehouse)
  - `bigquerystorage.googleapis.com` (High-throughput BigQuery Storage API)
  - `gmail.googleapis.com` (Gmail API for email extraction)
  - `drive.googleapis.com` (Google Drive API for external tables & exports)
  - `storage.googleapis.com` (Google Cloud Storage)
  - `iam.googleapis.com` & `iamcredentials.googleapis.com` (IAM authentication)
  - `aiplatform.googleapis.com` (Vertex AI / Gemini models)
  - `cloudresourcemanager.googleapis.com` (GCP Project metadata & policies)
- **BigQuery Historical Warehouse**:
  - `messages`: Historical emails partitioned daily (`internal_date`) and clustered by `sender_email` and `thread_id`.
  - `threads`: Conversation rollups, participants, and message counts.
  - `action_items`: AI-extracted tasks and commitments.
  - `subscriptions`: Recurring payments and billing receipts.
- **Service Account & IAM**: Dedicated `gmail-analyzer-sa` with least-privilege roles (`roles/bigquery.dataEditor`, `roles/bigquery.jobUser`, `roles/storage.objectAdmin`).
- **Cloud Storage**: GCS bucket with lifecycle auto-cleanup for Takeout `.mbox` staging and archive backups.

---

## 1. Prerequisites

### Step A: Install Terraform & Google Cloud CLI
On Windows using PowerShell and `winget`:
```powershell
# Install Terraform
winget install HashiCorp.Terraform

# Install Google Cloud SDK (gcloud CLI)
winget install Google.CloudSDK
```
*(After installation, restart your terminal to refresh your system PATH.)*

---

## 2. Google Cloud Authentication

Authenticate your terminal session and set your active project:
```powershell
# 1. Log in to your Google Cloud account
gcloud auth login

# 2. Set your default Google Cloud project
gcloud config set project YOUR_GCP_PROJECT_ID

# 3. Generate Application Default Credentials for Terraform
gcloud auth application-default login
```

---

## 3. Configuration

1. In this `backend/terraform/` directory, copy the example variables file:
```powershell
cp terraform.tfvars.example terraform.tfvars
```

2. Open `terraform.tfvars` and set your `project_id`:
```hcl
project_id = "your-actual-gcp-project-id"
region     = "us-central1"
```

---

## 4. Provision Infrastructure

Run the standard Terraform commands:

```powershell
# 1. Initialize the Google Cloud provider plugin
terraform init

# 2. Preview the resources that will be created
terraform plan

# 3. Provision the infrastructure
terraform apply
```

When prompted with `Do you want to perform these actions?`, type `yes`.

---

## 5. What Happens After Apply

1. **BigQuery Dataset & Tables**: Your dataset `gmail_analyzer` with all partitioned tables will be live in Google Cloud Console.
2. **Backend Service Account Key**: Terraform automatically writes the credentials key to `backend/service-account.json`. The Python backend will automatically use this key to stream and query your historical emails!

---

## 6. Starting the Personal Dashboard

### ⚡ One-Click Startup (Recommended)
From the project root, simply double-click:
- **`start_dashboard.bat`** (or run `.\start_dashboard.ps1` in PowerShell)

This automatically starts both the backend API (port 8000) and frontend (port 5173) in separate windows and opens your default browser directly to [http://localhost:5173](http://localhost:5173).

To shut down all services, double-click **`stop_dashboard.bat`** (or run `.\stop_dashboard.ps1`).

---

### Manual Terminal Startup

If you prefer running services manually in separate terminals:
Open a terminal in the project root (`personal_dashboard/`):

```powershell
# Start FastAPI backend with hot-reload
.\backend\.venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000
```
- **API Base**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Step 2: Start the Frontend Dashboard (React + Vite)
Open a second terminal in the project root:

```powershell
# Navigate to frontend and start Vite dev server
cd frontend
npm run dev
```
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)

### Step 3: Ingesting & Querying Emails
Once the dashboard is open at [http://localhost:5173](http://localhost:5173):
- **Sync 3 Days (Gmail → Google Drive)**:
  Click the green **"Sync 3 Days (Gmail → Drive)"** button in the top navigation bar. This retrieves emails from the past 72 hours via the Gmail API, saves them into `G:\My Drive\personal_dashboard\emails\`, and queries them live using External Tables.
- **Warehouse Re-seed**:
  Click **"Re-seed"** to stream sample historical messages, threads, and AI-extracted action items.

---

## 7. Clean Up (Optional)

To delete all provisioned Google Cloud resources at any time:
```powershell
terraform destroy
```
*(Note: To prevent accidental data loss, `delete_contents_on_destroy` defaults to `false`. If you want Terraform to wipe tables with data, change that setting to `true` in `terraform.tfvars` before destroying.)*
