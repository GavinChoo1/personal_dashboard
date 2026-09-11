import React from 'react';
import { Search, ExternalLink, Paperclip, Star, X, Mail, Calendar, User } from 'lucide-react';

export default function EmailsView({ emailsData, onSearchChange, onCategoryChange, selectedCategory, onSelectEmail, selectedEmail, onCloseModal }) {
  const { total = 0, items = [] } = emailsData || {};
  const categories = ['All', 'Primary', 'Finance', 'Updates', 'Newsletters', 'Promotions'];

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'primary':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'finance':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'updates':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'newsletters':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'promotions':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight font-display">
              Indexed Emails ({total})
            </h2>
            {items.length > 0 && items[0]?.storage_source && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {items[0].storage_source}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Live external table querying over Google Drive emails (NDJSON / Parquet).
          </p>
        </div>

        {/* Category Filters */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto self-start sm:self-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Filter by subject, sender, or keywords..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
        />
      </div>

      {/* Emails Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="w-8 px-3 py-3"></th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Subject & Snippet</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map(item => (
                <tr 
                  key={item.message_id} 
                  onClick={() => onSelectEmail(item.message_id)}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${
                    item.is_unread ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <td className="px-3 py-3.5 text-center">
                    {item.is_unread && (
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" title="Unread" />
                    )}
                  </td>
                  <td className={`px-4 py-3.5 whitespace-nowrap ${item.is_unread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                    {item.sender_name || item.sender_email}
                  </td>
                  <td className="px-4 py-3.5 max-w-lg">
                    <div className="flex items-center gap-1.5">
                      <span className={`${item.is_unread ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>{item.subject}</span>
                      {item.has_attachments && <Paperclip className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                      {item.is_starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 truncate">
                      {item.snippet}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(item.internal_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <a 
                      href={item.gmail_link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      <span>Gmail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onCloseModal}>
          <div 
            className="w-full max-w-2xl rounded-2xl glass-card border border-white/20 p-6 space-y-4 shadow-2xl animate-fade-in max-h-[85vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white leading-snug">{selectedEmail.subject}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <span>From:</span>
                    <strong className="text-slate-200">{selectedEmail.sender_name}</strong>
                    <span className="font-mono text-[11px] text-slate-500">({selectedEmail.sender_email})</span>
                  </div>
                </div>
                <button 
                  onClick={onCloseModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 py-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryBadge(selectedEmail.category)}`}>
                  {selectedEmail.category}
                </span>
                <span className="text-[11px] text-slate-400">
                  Received: {new Date(selectedEmail.internal_date).toLocaleString()}
                </span>
              </div>

              <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-slate-200 text-sm leading-relaxed overflow-y-auto max-h-[45vh]">
                {selectedEmail.body_plain || selectedEmail.snippet}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button 
                onClick={onCloseModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Close
              </button>
              <a 
                href={selectedEmail.gmail_link} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-900/40"
              >
                <span>Open in Gmail Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
