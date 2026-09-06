import React from 'react';
import { BarChart3, PieChart, Users, Database } from 'lucide-react';

export default function AnalyticsView({ trends, categories, senders }) {
  const maxVolume = trends.length > 0 ? Math.max(...trends.map(t => t.count), 1) : 1;
  const totalCategoryCount = categories.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
            BigQuery SQL Analytics & Metrics
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Real-time analytics executed directly over your partitioned BigQuery tables.
          </p>
        </div>
        <div className="bq-status-badge">
          <Database size={14} color="var(--google-blue)" />
          <span>Partition Pruned: DATE(internal_date)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Volume Trends Chart */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <BarChart3 size={18} color="var(--google-blue)" />
              <span>Email Volume Timeline (Last 30 Days)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            {trends.map((t, idx) => {
              const heightPercent = Math.round((t.count / maxVolume) * 100);
              return (
                <div 
                  key={idx} 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                  title={`${t.date}: ${t.count} emails (${t.unread_count} unread)`}
                >
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${Math.max(heightPercent, 12)}%`, 
                      background: 'linear-gradient(180deg, var(--google-blue), rgba(66, 133, 244, 0.3))',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            <span>{trends[0]?.date || '30 days ago'}</span>
            <span>{trends[trends.length - 1]?.date || 'Today'}</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <PieChart size={18} color="var(--purple-ai)" />
            <span>Category Distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categories.map((c, idx) => {
              const pct = Math.round((c.count / totalCategoryCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{c.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-card-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${pct}%`, 
                        background: idx % 2 === 0 ? 'var(--google-blue)' : 'var(--purple-ai)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Senders Table */}
      <div className="metric-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          <Users size={18} color="var(--google-green)" />
          <span>Top Senders in BigQuery Archive</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Email Address</th>
                <th>Volume</th>
                <th>Unread</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{s.sender_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.sender_email}</td>
                  <td><strong>{s.message_count}</strong></td>
                  <td>
                    {s.unread_count > 0 ? (
                      <span style={{ color: 'var(--gmail-red)', fontWeight: 600 }}>{s.unread_count}</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>0</span>
                    )}
                  </td>
                  <td>
                    <span className={`category-badge cat-${s.primary_category?.toLowerCase()}`}>
                      {s.primary_category}
                    </span>
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
