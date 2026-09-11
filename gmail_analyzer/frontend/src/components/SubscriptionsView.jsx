import React from 'react';
import { CreditCard, ExternalLink, ShieldAlert, DollarSign, Calendar } from 'lucide-react';

export default function SubscriptionsView({ subscriptionsData }) {
  const { total_monthly_spend = 0, subscriptions = [] } = subscriptionsData || {};
  const annualProjected = (total_monthly_spend * 12).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight font-display">
          Subscriptions & Recurring Expenses
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Recurring charges, SaaS memberships, and receipts identified automatically from your inbox.
        </p>
      </div>

      {/* Burn Rate Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Estimated Monthly Burn
          </div>
          <div className="text-3xl font-black text-emerald-400 font-display tracking-tight">
            ${total_monthly_spend}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Across {subscriptions.length} active recurring services</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Projected Annual Cost
          </div>
          <div className="text-3xl font-black text-white font-display tracking-tight">
            ${annualProjected}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Assuming constant subscription cadence</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Billing Sender</th>
                <th className="px-4 py-3">Estimated Cost</th>
                <th className="px-4 py-3">Cadence</th>
                <th className="px-4 py-3">Last Receipt Date</th>
                <th className="px-4 py-3 text-right">Manage / Cancel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.map(s => (
                <tr key={s.subscription_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white whitespace-nowrap">{s.service_name}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{s.sender_email}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-white text-sm">
                      ${Number(s.amount).toFixed(2)}
                    </span>{' '}
                    <span className="text-[10px] text-slate-400 uppercase">{s.currency}</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300 capitalize">
                      {s.frequency}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{s.last_billed_date || 'Recent'}</td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {s.unsubscribe_url ? (
                      <a 
                        href={s.unsubscribe_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors"
                      >
                        <span>Manage Subscription</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-slate-500 text-xs">Direct in Gmail</span>
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
