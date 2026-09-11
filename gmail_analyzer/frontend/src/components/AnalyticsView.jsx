import React from 'react';
import { BarChart3, PieChart, Users, Database } from 'lucide-react';

export default function AnalyticsView({ trends, categories, senders }) {
  const maxVolume = trends.length > 0 ? Math.max(...trends.map(t => t.count), 1) : 1;
  const totalCategoryCount = categories.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Title & BigQuery Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">
            BigQuery SQL Analytics & Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics executed directly over your partitioned BigQuery tables.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 self-start sm:self-auto">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Partition Pruned: DATE(internal_date)</span>
        </div>
      </div>

      {/* Grid: Trends Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trends Chart */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold text-sm text-white">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Email Volume Timeline (Last 30 Days)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Daily Partitioned</span>
          </div>

          <div className="flex items-end gap-1.5 h-44 py-2 border-b border-white/10">
            {trends.map((t, idx) => {
              const heightPercent = Math.round((t.count / maxVolume) * 100);
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-[10px] text-white px-2 py-1 rounded shadow-lg border border-white/10 pointer-events-none whitespace-nowrap z-10">
                    {t.date}: {t.count} emails ({t.unread_count} unread)
                  </div>
                  <div 
                    style={{ height: `${Math.max(heightPercent, 8)}%` }} 
                    className="w-full rounded-t bg-gradient-to-t from-blue-600/40 to-blue-400 group-hover:from-blue-500 group-hover:to-cyan-300 transition-all duration-200"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>{trends[0]?.date || '30 days ago'}</span>
            <span>{trends[trends.length - 1]?.date || 'Today'}</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 font-semibold text-sm text-white mb-5">
            <PieChart className="w-4 h-4 text-purple-400" />
            <span>Category Distribution</span>
          </div>

          <div className="space-y-4">
            {categories.map((c, idx) => {
              const pct = Math.round((c.count / totalCategoryCount) * 100);
              const colorClass = idx % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500';
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-200">{c.category}</span>
                    <span className="text-slate-400">{c.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${pct}%` }} 
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Senders Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 font-semibold text-sm text-white mb-4">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Top Senders in BigQuery Archive</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="px-4 py-3">Sender Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3 text-center">Volume</th>
                <th className="px-4 py-3 text-center">Unread</th>
                <th className="px-4 py-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {senders.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white whitespace-nowrap">{s.sender_name}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{s.sender_email}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-200">{s.message_count}</td>
                  <td className="px-4 py-3.5 text-center">
                    {s.unread_count > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        {s.unread_count}
                      </span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
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
