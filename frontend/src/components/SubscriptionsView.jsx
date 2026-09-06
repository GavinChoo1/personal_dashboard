import React from 'react';
import { CreditCard, ExternalLink, ShieldAlert } from 'lucide-react';

export default function SubscriptionsView({ subscriptionsData }) {
  const { total_monthly_spend = 0, subscriptions = [] } = subscriptionsData || {};
  const annualProjected = (total_monthly_spend * 12).toFixed(2);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
            Subscriptions & Recurring Expenses
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Recurring charges, SaaS memberships, and receipts identified automatically from your inbox.
          </p>
        </div>
      </div>

      {/* Burn Rate Summary Banner */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '2rem' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid var(--google-green)' }}>
          <div className="metric-label">Estimated Monthly Burn</div>
          <div className="metric-val" style={{ color: 'var(--google-green)' }}>
            ${total_monthly_spend}
          </div>
          <div className="metric-sub">Across {subscriptions.length} active recurring services</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--google-blue)' }}>
          <div className="metric-label">Projected Annual Cost</div>
          <div className="metric-val">
            ${annualProjected}
          </div>
          <div className="metric-sub">Assuming constant subscription cadence</div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="metric-card" style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Billing Sender</th>
                <th>Estimated Cost</th>
                <th>Cadence</th>
                <th>Last Receipt Date</th>
                <th>Manage / Cancel</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(s => (
                <tr key={s.subscription_id}>
                  <td style={{ fontWeight: 600 }}>{s.service_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.sender_email}</td>
                  <td>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      ${Number(s.amount).toFixed(2)}
                    </strong>{' '}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.currency}</span>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{s.frequency}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.last_billed_date || 'Recent'}</td>
                  <td>
                    {s.unsubscribe_url ? (
                      <a 
                        href={s.unsubscribe_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-secondary"
                        style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <span>Manage Subscription</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Direct in Gmail</span>
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
