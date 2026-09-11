import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, CreditCard, Sparkles, ExternalLink, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function OverviewView({ stats, digest, onSelectEmail }) {
  const cards = [
    {
      label: 'Historical Emails',
      value: stats?.total_messages || 0,
      sub: stats?.is_bigquery ? 'Stored in Google BigQuery' : 'Cached Locally',
      icon: Mail,
      accent: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      label: 'Unread in Inbox',
      value: stats?.unread_messages || 0,
      sub: 'Needs attention',
      icon: AlertTriangle,
      accent: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    {
      label: 'Pending Action Items',
      value: stats?.pending_action_items || 0,
      sub: 'Tasks & deadlines detected',
      icon: CheckCircle2,
      accent: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      label: 'Monthly Subscriptions',
      value: `$${stats?.monthly_subscription_spend || '0.00'}`,
      sub: `${stats?.active_subscriptions_count || 0} active recurring services`,
      icon: CreditCard,
      accent: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Newsletter Clutter',
      value: stats?.newsletter_clutter_count || 0,
      sub: 'Promotions & weekly digests',
      icon: ShieldCheck,
      accent: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div 
              key={i} 
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{c.label}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${c.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-display tracking-tight mb-1">{c.value}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                <span>{c.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Daily Executive Briefing */}
      {digest && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          {/* Digest Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Gemini Executive Briefing</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display">Today's Inbox Intelligence</h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-400">{digest.date}</div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mt-1">
                <span>Inbox Health Score: {digest.inbox_health_score}/100</span>
              </div>
            </div>
          </div>

          {/* Digest Takeaways */}
          <div className="py-5 space-y-2.5">
            {digest.takeaways?.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></span>
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* High Priority Threads Table */}
          <div className="pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span>High-Priority Threads</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                {digest.key_threads?.length || 0}
              </span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    <th className="px-4 py-3">Sender</th>
                    <th className="px-4 py-3">Subject & Snippet</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {digest.key_threads?.map((thread, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-white whitespace-nowrap">
                        {thread.sender}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-200">{thread.subject}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5 max-w-xl truncate">{thread.snippet}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {thread.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <a 
                          href={`https://mail.google.com/mail/u/0/#all/${thread.thread_id}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                          <span>Open in Gmail</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
