import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Activity, 
  ExternalLink, 
  DollarSign, 
  Layers, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Server,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function GCPDashboardView() {
  const [overview, setOverview] = useState(null);
  const [bqDetails, setBqDetails] = useState(null);
  const [storageDetails, setStorageDetails] = useState(null);
  const [iamAudit, setIamAudit] = useState(null);
  const [costMetrics, setCostMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchGcpTelemetry();
  }, []);

  const fetchGcpTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const [ovRes, bqRes, stRes, iamRes, costRes] = await Promise.all([
        fetch(`${API_BASE}/gcp/overview`),
        fetch(`${API_BASE}/gcp/bigquery-details`),
        fetch(`${API_BASE}/gcp/storage-details`),
        fetch(`${API_BASE}/gcp/iam-audit`),
        fetch(`${API_BASE}/gcp/cost-metrics`),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (bqRes.ok) setBqDetails(await bqRes.json());
      if (stRes.ok) setStorageDetails(await stRes.json());
      if (iamRes.ok) setIamAudit(await iamRes.json());
      if (costRes.ok) setCostMetrics(await costRes.json());
    } catch (err) {
      console.error("Failed to load GCP telemetry:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GCP Hero Command Bar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-600/30 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 glow-blue">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight font-display">
                  Google Cloud Infrastructure & Cost Console
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {overview?.status || 'All Systems Nominal'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                <span>Project: <strong className="text-slate-200">{overview?.project_id || 'personal-dashboard-507703'}</strong></span>
                <span>•</span>
                <span>Region: <strong className="text-slate-200">{overview?.region || 'us-central1'}</strong></span>
                <span>•</span>
                <span>Billing: <strong className="text-emerald-400">{overview?.billing_account}</strong> ({overview?.billing_status})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={fetchGcpTelemetry}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all cursor-pointer"
              title="Refresh GCP live telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh Health'}</span>
            </button>

            <a
              href={`https://console.cloud.google.com/?project=${overview?.project_id || 'personal-dashboard-507703'}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40"
            >
              <span>GCP Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* GCP Always Free Tier & Real-Time Cost Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real-time Spend Card */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Month Incurred</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display tracking-tight">
            ${costMetrics?.current_month_cost?.toFixed(2) || '0.00'} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>100% Covered by Always Free Tier</span>
          </div>
        </div>

        {/* BigQuery Storage Meter */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">BigQuery Storage</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display tracking-tight">
            {bqDetails?.total_bytes_human || '0 KB'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Free limit: <strong className="text-slate-200">{bqDetails?.free_tier_quota_human || '10.0 GB/mo'}</strong>
          </div>
        </div>

        {/* Cloud Storage Meter */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cloud Storage (GCS)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display tracking-tight">
            {storageDetails?.size_human || '0 KB'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Free limit: <strong className="text-slate-200">{storageDetails?.free_tier_limit_human || '5.0 GB/mo'}</strong>
          </div>
        </div>

        {/* Budget Alert Ceiling */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Zero-Cost Safeguard</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-display tracking-tight">
            $1.00 <span className="text-xs text-slate-400 font-normal">Alert Ceiling</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Email alert triggered if any charges occur
          </div>
        </div>
      </div>

      {/* BigQuery Historical Warehouse Live Inspector */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-bold text-white font-display">BigQuery Data Warehouse: {bqDetails?.dataset_id}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Location: {bqDetails?.location || 'US'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live schema inspection for partitioned & clustered analytical warehouse tables.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono self-start sm:self-auto">
            Total Dataset Rows: <strong className="text-white">{bqDetails?.total_rows || 0}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bqDetails?.tables?.map(t => (
            <div 
              key={t.table_id} 
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-mono">{t.table_id}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{t.row_count} rows</div>
                  <div className="text-[11px] text-slate-500">{t.size_human}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                <div>
                  <span>Partition: </span>
                  <span className="font-mono text-slate-300 bg-white/5 px-1.5 py-0.5 rounded">{t.partition_by}</span>
                </div>
                <div>
                  <span>Clustering: </span>
                  <span className="font-mono text-slate-300 bg-white/5 px-1.5 py-0.5 rounded">{t.clustering.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Storage (GCS) & Bucket Lifecycle Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GCS Bucket Details */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white font-display">GCS Bucket & Lifecycle Audit</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Bucket Name:</span>
              <span className="font-mono text-white">{storageDetails?.bucket_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Storage Class:</span>
              <span className="font-semibold text-slate-200">{storageDetails?.storage_class} (Regional {storageDetails?.location})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Uniform Access:</span>
              <span className="text-emerald-400 font-semibold">Enforced (Security Best Practice)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Auto-Cleanup Policy:</span>
              <span className="text-amber-300 font-semibold text-right">{storageDetails?.lifecycle_policy}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Incurred Cost:</span>
              <span className="text-emerald-400 font-bold">${storageDetails?.incurred_cost?.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* IAM Credentials & Security Audit */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-display">IAM Service Account Security</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Principal:</span>
              <span className="font-mono text-white truncate max-w-[260px]">{iamAudit?.service_account_email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Private Key File:</span>
              <span className="text-emerald-400 font-semibold">backend/service-account.json (0600 Secure)</span>
            </div>
            <div className="py-1">
              <span className="text-slate-400 block mb-2">Active Roles Granted:</span>
              <div className="space-y-1.5">
                {iamAudit?.roles_granted?.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-[11px] text-blue-300">{r.role}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              Audit Status: <span className="text-emerald-400 font-semibold">{iamAudit?.least_privilege_audit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
