import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, CreditCard, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function OverviewView({ stats, digest, onSelectEmail }) {
  const cards = [
    {
      label: 'Historical Emails',
      value: stats?.total_messages || 0,
      sub: stats?.is_bigquery ? 'Stored in Google BigQuery' : 'Cached Locally',
      icon: Mail,
      color: 'var(--google-blue)',
      bg: 'rgba(66, 133, 244, 0.12)'
    },
    {
      label: 'Unread in Inbox',
      value: stats?.unread_messages || 0,
      sub: 'Needs attention',
      icon: AlertTriangle,
      color: 'var(--gmail-red)',
      bg: 'rgba(234, 67, 53, 0.12)'
    },
    {
      label: 'Pending Action Items',
      value: stats?.pending_action_items || 0,
      sub: 'Tasks & deadlines detected',
      icon: CheckCircle2,
      color: 'var(--google-yellow)',
      bg: 'rgba(251, 188, 5, 0.12)'
    },
    {
      label: 'Monthly Subscriptions',
      value: `$${stats?.monthly_subscription_spend || '0.00'}`,
      sub: `${stats?.active_subscriptions_count || 0} active recurring services`,
      icon: CreditCard,
      color: 'var(--google-green)',
      bg: 'rgba(52, 168, 83, 0.12)'
    },
    {
      label: 'Newsletter Clutter',
      value: stats?.newsletter_clutter_count || 0,
      sub: 'Promotions & updates',
      icon: ShieldCheck,
      color: 'var(--purple-ai)',
      bg: 'rgba(168, 85, 247, 0.12)'
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* KPI Metrics */}
      <div className="metrics-grid">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">{c.label}</span>
                <div className="metric-icon-wrap" style={{ background: c.bg, color: c.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="metric-val">{c.value}</div>
              <div className="metric-sub">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* AI Daily Executive Briefing */}
      {digest && (
        <div className="digest-card">
          <div className="digest-header">
            <div>
              <span className="digest-tag">
                <Sparkles size={14} /> Gemini Executive Briefing
              </span>
              <h2 className="digest-title">Today's Inbox Intelligence</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{digest.date}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--google-green)', fontWeight: 600, marginTop: '4px' }}>
                Health Score: {digest.inbox_health_score}/100
              </div>
            </div>
          </div>

          <div className="digest-takeaways">
            {digest.takeaways?.map((point, idx) => (
              <div key={idx} className="takeaway-item">
                <span style={{ color: 'var(--purple-ai)', marginTop: '2px' }}>•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
            High-Priority Threads
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {digest.key_threads?.map((thread, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      {thread.sender}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{thread.subject}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {thread.snippet}
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge cat-${thread.category?.toLowerCase()}`}>
                        {thread.category}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <a 
                        href={`https://mail.google.com/mail/u/0/#all/${thread.thread_id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="link-gmail"
                      >
                        <span>Open in Gmail</span>
                        <ExternalLink size={13} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
