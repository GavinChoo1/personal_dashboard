import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Server, 
  Cpu, 
  Film, 
  ExternalLink, 
  Lightbulb, 
  ShieldCheck, 
  Search, 
  CreditCard,
  ArrowUpRight,
  Database,
  HardDrive,
  Activity
} from 'lucide-react';

export default function CostDashboardView({ costOverview, costBreakdown, costTimeline, costRecommendations, gcpUsage }) {
  const [filterCat, setFilterCat] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const overview = costOverview || {};
  const breakdown = costBreakdown || { categories: [], items: [] };
  const timeline = costTimeline || [];
  const recommendations = costRecommendations || [];

  const maxTimelineTotal = timeline.length > 0 ? Math.max(...timeline.map(t => t.total), 1) : 1;

  // Filter items in detailed breakdown table
  const filteredItems = (breakdown.items || []).filter(item => {
    const matchesCat = filterCat === 'All' || item.category === filterCat;
    const matchesSearch = !searchTerm || 
      item.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryList = ['All', ...new Set((breakdown.categories || []).map(c => c.category))];

  return (
    <div className="animate-fade-in">
      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            Cost & Expense Intelligence
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            High-level financial overview, recurring SaaS burn-rate, cloud spending, and granular invoice breakdown.
          </p>
        </div>

        <div className="bq-status-badge" style={{ borderColor: 'rgba(52, 168, 83, 0.4)' }}>
          <ShieldCheck size={15} color="var(--google-green)" />
          <span>GCP Status: {overview.google_cloud_status?.tier || 'Always Free Tier'}</span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid var(--google-blue)' }}>
          <div className="metric-card-top">
            <span className="metric-label">Total Monthly Spend</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(66, 133, 244, 0.15)', color: 'var(--google-blue)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-val" style={{ color: 'var(--text-main)' }}>
            ${overview.total_monthly_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="metric-sub">Across {overview.active_subscriptions_count || 0} active recurring services</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--purple-ai)' }}>
          <div className="metric-card-top">
            <span className="metric-label">Projected Annual Spend</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple-ai)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-val" style={{ color: '#d8b4fe' }}>
            ${overview.projected_annual_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="metric-sub">Annualized run-rate at current cadence</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--google-yellow)' }}>
          <div className="metric-card-top">
            <span className="metric-label">Developer & AI Tools</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(251, 188, 5, 0.15)', color: 'var(--google-yellow)' }}>
              <Cpu size={18} />
            </div>
          </div>
          <div className="metric-val">
            ${overview.dev_and_ai_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="metric-sub">GitHub Copilot, OpenAI, Linear</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--google-green)' }}>
          <div className="metric-card-top">
            <span className="metric-label">Cloud Infrastructure</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(52, 168, 83, 0.15)', color: 'var(--google-green)' }}>
              <Server size={18} />
            </div>
          </div>
          <div className="metric-val">
            ${overview.cloud_infrastructure_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="metric-sub">AWS ($28.50) • GCP ($0.00 Free Tier)</div>
        </div>
      </div>

      {/* Visual Analytics Grid: Timeline & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* 6-Month Spending Trajectory */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--google-blue)" />
              <span>Historical Monthly Spend Trajectory</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Past 6 Months</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '180px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            {timeline.map((item, idx) => {
              const heightPercent = Math.round((item.total / maxTimelineTotal) * 100);
              return (
                <div 
                  key={idx} 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                  title={`${item.month}: $${item.total.toFixed(2)} (Cloud: $${item.cloud}, Dev/AI: $${item.dev_ai}, Streaming: $${item.entertainment})`}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    ${Math.round(item.total)}
                  </div>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${Math.max(heightPercent, 15)}%`, 
                      background: 'linear-gradient(180deg, var(--google-blue), rgba(66, 133, 244, 0.4))',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }} 
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', whiteSpace: 'nowrap' }}>
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Film size={18} color="var(--purple-ai)" />
            <span>Monthly Cost by Category</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {breakdown.categories.map((cat, idx) => {
              const colors = ['var(--google-blue)', 'var(--google-green)', 'var(--purple-ai)', 'var(--google-yellow)'];
              const col = colors[idx % colors.length];
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      <strong>${cat.total_monthly.toFixed(2)}</strong>/mo ({cat.percentage}%)
                    </span>
                  </div>
                  <div style={{ height: '9px', background: 'var(--bg-card-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${cat.percentage}%`, 
                        background: col,
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {cat.services.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Cost Optimization Recommendations */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Lightbulb size={18} color="var(--google-yellow)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Cost Optimization Recommendations</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {recommendations.map(rec => (
            <div 
              key={rec.id} 
              className="metric-card" 
              style={{ 
                padding: '1.25rem', 
                background: 'rgba(21, 29, 48, 0.75)', 
                border: '1px solid rgba(251, 188, 5, 0.25)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--google-yellow)' }}>
                  {rec.type}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(52, 168, 83, 0.2)', color: '#86efac' }}>
                  Save: {rec.potential_savings}
                </span>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {rec.title}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
                {rec.description}
              </p>

              {rec.action_url && (
                <a 
                  href={rec.action_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="link-gmail" 
                  style={{ fontSize: '0.8rem' }}
                >
                  <span>Review in Portal</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Google BigQuery & API Cost Section */}
      <div className="metric-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(59, 130, 246, 0.25)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <Database size={20} style={{ color: '#3b82f6' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Google BigQuery & Cloud API Usage
              </h3>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.75rem', fontWeight: 600 }}>
                ● 100% Free Tier Covered
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Project: <code style={{ color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{gcpUsage?.gcp_project_id || 'personal-dashboard-507703'}</code> • Dataset: <code style={{ color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{gcpUsage?.bigquery_dataset || 'gmail_analyzer'}</code>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Incurred Cost</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.02em' }}>
              ${Number(gcpUsage?.total_incurred_cost || 0).toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>USD</span>
            </div>
          </div>
        </div>

        {/* BigQuery Dual Quota Meters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Meter 1: BigQuery Storage */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={18} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>BigQuery Storage Quota</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>
                {gcpUsage?.bigquery?.storage_used_human || '63.8 KB'} / {gcpUsage?.bigquery?.storage_limit_human || '10.0 GB'}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.6rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${Math.max(Number(gcpUsage?.bigquery?.storage_percentage || 0.01), 1)}%`, 
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', 
                  borderRadius: '4px' 
                }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Consumed: {gcpUsage?.bigquery?.storage_percentage || '0.0006'}%</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Incurred Cost: $0.00</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: '1.4' }}>
              Historical emails, threads & action items partitioned by day. 10.0 GB free monthly forever.
            </div>
          </div>

          {/* Meter 2: BigQuery Query Analysis */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>BigQuery Query Processing</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
                {gcpUsage?.bigquery?.query_bytes_human || '0.0 MB'} / {gcpUsage?.bigquery?.query_limit_human || '1.0 TB / mo'}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.6rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${Math.max(Number(gcpUsage?.bigquery?.query_percentage || 0.01), 1)}%`, 
                  background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', 
                  borderRadius: '4px' 
                }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Executed: {gcpUsage?.bigquery?.total_queries_run || 52} SQL queries</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Incurred Cost: $0.00</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: '1.4' }}>
              Columnar scanning optimized via clustering. 1.0 TB monthly query processing included at zero cost.
            </div>
          </div>
        </div>

        {/* API Services Cost Breakdown Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>API Service & Purpose</th>
                <th style={{ padding: '0.75rem 1rem' }}>Live Usage Monitored</th>
                <th style={{ padding: '0.75rem 1rem' }}>Free Tier Quota</th>
                <th style={{ padding: '0.75rem 1rem' }}>Quota Used</th>
                <th style={{ padding: '0.75rem 1rem' }}>Pricing Rate</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Incurred Cost</th>
              </tr>
            </thead>
            <tbody>
              {(gcpUsage?.apis || []).map((api, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{api.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{api.purpose}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                    {api.usage}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {api.free_tier_quota}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '0.75rem' }}>
                      {api.quota_consumed}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {api.pricing_rate}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                    ${Number(api.incurred_cost).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Cost Breakdown Table */}
      <div className="metric-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Detailed Service Breakdown</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              All recurring subscriptions, payment cards, and annualized projections.
            </p>
          </div>

          {/* Category Pills Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categoryList.map(c => (
              <button
                key={c}
                className={`tab-btn ${filterCat === c ? 'active' : ''}`}
                onClick={() => setFilterCat(c)}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="search-box-wrap" style={{ marginBottom: '1.25rem', padding: '0.4rem 0.75rem' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search vendor, category, or card..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.92rem', padding: '0.4rem 0.6rem' }}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service / Vendor</th>
                <th>Category</th>
                <th>Monthly Rate</th>
                <th>Annual Cost</th>
                <th>Billing Cadence</th>
                <th>Payment Method</th>
                <th>Last Invoiced</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.subscription_id}>
                  <td style={{ fontWeight: 600 }}>
                    {item.service_name}
                  </td>
                  <td>
                    <span className="category-badge cat-primary" style={{ fontSize: '0.72rem' }}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      ${item.monthly_amount.toFixed(2)}
                    </strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    ${item.annual_amount.toFixed(2)}/yr
                  </td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                    {item.frequency}
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CreditCard size={13} />
                      {item.payment_method}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {item.last_billed_date || 'Current'}
                  </td>
                  <td>
                    {item.unsubscribe_url ? (
                      <a 
                        href={item.unsubscribe_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-secondary"
                        style={{ display: 'inline-flex', padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                      >
                        <span>Manage</span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Gmail Thread</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
