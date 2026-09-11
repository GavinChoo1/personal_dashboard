import React from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  ExternalLink,
  Activity,
  Database,
  HardDrive,
  DollarSign
} from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-600/30 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 glow-blue">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight font-display">
                Google Cloud <span className="text-slate-400 font-normal">Health & Cost Console</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                personal-dashboard-507703
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live infrastructure telemetry, BigQuery storage, GCS lifecycle & Always Free Tier spend
            </p>
          </div>
        </div>

        {/* Quick Badges & External Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>$0.00 Incurred / Free Tier</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>$1.00 Alert Guard</span>
          </div>

          <a
            href="https://console.cloud.google.com/?project=personal-dashboard-507703"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40"
          >
            <span>GCP Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sub-bar breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between py-2 text-xs text-slate-400 min-w-max">
          <div className="flex items-center gap-6">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Infrastructure Telemetry
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              BigQuery Warehouse (4 Tables)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              GCS Auto-Lifecycle Bucket
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              IAM Security & Roles
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Free Tier Quotas
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden md:block">
            Backend API: http://localhost:8000/api/gcp
          </div>
        </div>
      </div>
    </header>
  );
}
