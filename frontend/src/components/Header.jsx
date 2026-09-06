import React from 'react';
import { Mail, RefreshCw, Database, CheckSquare, BarChart2, DollarSign, MessageSquare, Inbox } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, syncStatus, isSyncing, onTriggerSync, onSyncGmailToDrive }) {
  const tabs = [
    { id: 'overview', label: 'Executive Briefing', icon: Inbox },
    { id: 'costs', label: 'Cost Dashboard', icon: DollarSign },
    { id: 'actions', label: 'Action Items', icon: CheckSquare, badge: syncStatus?.pending_actions },
    { id: 'analytics', label: 'BigQuery Analytics', icon: BarChart2 },
    { id: 'subscriptions', label: 'Subscriptions & Bills', icon: DollarSign },
    { id: 'emails', label: 'All Emails', icon: Mail },
    { id: 'ask', label: 'Ask Gmail AI', icon: MessageSquare },
  ];

  const hasExternalTable = syncStatus?.external_table?.exists;

  return (
    <header>
      <div className="navbar">
        <div className="brand-section">
          <div className="brand-icon">
            <Mail size={22} />
          </div>
          <div>
            <h1 className="brand-title">Gmail Intelligence & Warehouse</h1>
          </div>
          <span className="brand-badge">
            {hasExternalTable ? 'External Tables Mode' : 'BigQuery v1'}
          </span>
        </div>

        <div className="nav-actions">
          <div 
            className="bq-status-badge" 
            title={hasExternalTable ? `External Table on Google Drive: ${syncStatus?.external_table?.file_path}` : `Storage: ${syncStatus?.storage_mode}`}
            style={hasExternalTable ? { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' } : {}}
          >
            <span className="pulse-dot" style={hasExternalTable ? { background: '#10b981' } : {}}></span>
            <span>
              {hasExternalTable 
                ? `Google Drive: ${syncStatus.external_table.record_count} emails (3-day)` 
                : (syncStatus?.is_bigquery_connected ? `BigQuery: ${syncStatus.bigquery_dataset}` : 'Local Cache Mode')}
            </span>
          </div>

          {onSyncGmailToDrive && (
            <button 
              id="sync-drive-btn"
              className="btn-primary" 
              onClick={onSyncGmailToDrive} 
              disabled={isSyncing}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
              title="Fetch past 3 days from Gmail API and load into Google Drive external table"
            >
              <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync 3 Days (Gmail → Drive)"}</span>
            </button>
          )}

          <button 
            id="sync-btn"
            className="tab-btn" 
            onClick={onTriggerSync} 
            disabled={isSyncing}
            style={{ fontSize: '0.85rem' }}
            title="Re-seed warehouse dataset"
          >
            <span>Re-seed</span>
          </button>
        </div>
      </div>

      <nav className="tabs-bar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
