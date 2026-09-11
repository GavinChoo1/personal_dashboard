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
  Activity,
  Calendar
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
      item.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryList = ['All', ...new Set((breakdown.categories || []).map(c => c.category))];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">
            Cost & Expense Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            High-level financial overview, recurring SaaS burn-rate, cloud spending, and granular invoice breakdown.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>GCP Status: {overview.google_cloud_status?.tier || 'Always Free Tier'}</span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Spend */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Monthly Spend</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display tracking-tight">
            ${overview.total_monthly_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {overview.active_subscriptions_count || 0} active recurring services
          </div>
        </div>

        {/* Projected Annual Spend */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Projected Annual Spend</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300 font-display tracking-tight">
            ${overview.projected_annual_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Annualized run-rate at current cadence
          </div>
        </div>

        {/* Developer & AI Tools */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Developer & AI Tools</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display tracking-tight">
            ${overview.dev_and_ai_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            AI APIs, Copilot, tooling subscriptions
          </div>
        </div>

        {/* Cloud Infrastructure */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cloud Infrastructure</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display tracking-tight">
            ${overview.cloud_infrastructure_spend?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            GCP ($0.00 Always Free Tier)
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Timeline & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Month Spending Trajectory */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold text-sm text-white">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Historical Monthly Spend Trajectory</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Past 6 Months</span>
          </div>

          <div className="flex items-end gap-3 h-48 py-2 border-b border-white/10">
            {timeline.map((item, idx) => {
              const heightPercent = Math.round((item.total / maxTimelineTotal) * 100);
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  title={`${item.month}: $${item.total.toFixed(2)}`}
                >
                  <div className="text-[10px] font-bold text-slate-400 mb-1 group-hover:text-white transition-colors">
                    ${Math.round(item.total)}
                  </div>
                  <div 
                    style={{ height: `${Math.max(heightPercent, 12)}%` }} 
                    className="w-full rounded-t bg-gradient-to-t from-blue-600/40 to-blue-400 group-hover:from-blue-500 group-hover:to-cyan-300 transition-all duration-200"
                  />
                  <div className="text-[10px] text-slate-400 mt-2 whitespace-nowrap font-mono">
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 font-semibold text-sm text-white mb-4">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Monthly Cost by Category</span>
          </div>

          <div className="space-y-4">
            {breakdown.categories?.map((cat, idx) => {
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
              const barColor = colors[idx % colors.length];
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-200 font-semibold">{cat.category}</span>
                    <span className="text-slate-400">
                      <strong className="text-white">${cat.total_monthly.toFixed(2)}</strong>/mo ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${cat.percentage}%` }} 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {cat.services?.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Cost Optimization Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>AI Cost Optimization Recommendations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div 
                key={rec.id} 
                className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/[0.02] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      {rec.type}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Save: {rec.potential_savings}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Impact: {rec.impact}</span>
                  <a 
                    href={rec.action_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Manage Service</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Cloud Platform & Storage Quotas */}
      {gcpUsage && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Google Cloud Storage & API Consumption</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Project: <code className="text-slate-300 font-mono">{gcpUsage.gcp_project_id}</code>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
              <span>{gcpUsage.status || '100% Free Tier Covered'}</span>
            </div>
          </div>

          {/* Storage Meter */}
          {gcpUsage.storage && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bucket: {gcpUsage.storage.bucket_name}</span>
                </span>
                <span className="text-slate-400">
                  {gcpUsage.storage.storage_used_human} / {gcpUsage.storage.storage_limit_human}
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.max(gcpUsage.storage.storage_percentage, 0.5)}%` }} 
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{gcpUsage.storage.files_count} staged files (auto-purged after 30 days)</span>
                <span className="font-bold text-emerald-400">${gcpUsage.storage.storage_cost?.toFixed(2)} cost</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Invoices / Subscriptions Breakdown Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Granular Cost Breakdown & Receipt Register</span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text" 
              placeholder="Search service, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categoryList.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterCat === cat
                  ? 'bg-white/10 text-white font-semibold border border-white/15'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Monthly</th>
                <th className="px-4 py-3">Annualized</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Last Billed</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(item => (
                <tr key={item.subscription_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white whitespace-nowrap">{item.service_name}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-bold text-white">
                    ${item.monthly_amount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                    ${item.annual_amount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{item.payment_method}</td>
                  <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{item.last_billed_date || 'Recent'}</td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {item.unsubscribe_url ? (
                      <a 
                        href={item.unsubscribe_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3 h-3" />
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
