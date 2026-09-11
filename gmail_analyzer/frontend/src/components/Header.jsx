import React from 'react';
import { 
  Mail, 
  RefreshCw, 
  Database, 
  CheckSquare, 
  BarChart2, 
  DollarSign, 
  MessageSquare, 
  Inbox, 
  Sparkles 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  syncStatus, 
  isSyncing, 
  onTriggerSync, 
  onSyncGmailToDrive 
}) {
  const tabs = [
    { id: 'overview', label: 'Executive Briefing', icon: Inbox },
    { id: 'costs', label: 'Cost Intelligence', icon: DollarSign },
    { id: 'actions', label: 'Action Items', icon: CheckSquare, badge: syncStatus?.pending_actions },
    { id: 'analytics', label: 'BigQuery Analytics', icon: BarChart2 },
    { id: 'subscriptions', label: 'Subscriptions & Bills', icon: DollarSign },
    { id: 'emails', label: 'All Emails', icon: Mail },
    { id: 'ask', label: 'Ask Gmail AI', icon: MessageSquare },
  ];

  const hasExternalTable = syncStatus?.external_table?.exists;

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-white/10 transition-all duration-300">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 via-red-600/30 to-amber-500/20 border border-red-500/30 flex items-center justify-center text-red-400 glow-red">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight font-display">
                Gmail Intelligence <span className="text-slate-400 font-normal">& Warehouse</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-3 h-3 text-blue-400" />
                {hasExternalTable ? 'External Tables' : 'BigQuery v1'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Personal analytics, Gemini task extraction & cloud cost engine</p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Storage Mode Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasExternalTable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : syncStatus?.is_bigquery_connected
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-800/80 border-white/10 text-slate-300'
            }`}
            title={hasExternalTable ? `External Table on Drive: ${syncStatus?.external_table?.file_path}` : `Storage: ${syncStatus?.storage_mode}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                hasExternalTable ? 'bg-emerald-400' : 'bg-blue-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                hasExternalTable ? 'bg-emerald-500' : 'bg-blue-500'
              }`}></span>
            </span>
            <span className="truncate max-w-[220px]">
              {hasExternalTable 
                ? `Google Drive: ${syncStatus.external_table.record_count} emails` 
                : (syncStatus?.is_bigquery_connected ? `BigQuery: ${syncStatus.bigquery_dataset}` : 'Local Cache Mode')}
            </span>
          </div>

          {/* Sync Gmail to Drive Button */}
          {onSyncGmailToDrive && (
            <button 
              id="sync-drive-btn"
              onClick={onSyncGmailToDrive} 
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
              title="Fetch past 3 days from Gmail API and load into Google Drive external table"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync 3 Days (Gmail → Drive)"}</span>
            </button>
          )}

          {/* Re-seed Button */}
          <button 
            id="sync-btn"
            onClick={onTriggerSync} 
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Re-seed warehouse dataset with historical sample emails"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Re-seed</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 py-1.5 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
