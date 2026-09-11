import React, { useState } from 'react';
import { CheckSquare, Calendar, ExternalLink, Filter, CheckCircle2, Clock } from 'lucide-react';

export default function ActionItemsView({ actions, onToggleAction }) {
  const [filter, setFilter] = useState('all');

  const filtered = actions.filter(item => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">
            Extracted Action Items & Deadlines
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Commitments, reply requests, and review tasks automatically identified from your email threads.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'all' 
                ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({actions.length})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'pending' 
                ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({actions.filter(a => a.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'completed' 
                ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({actions.filter(a => a.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const isCompleted = item.status === 'completed';
          return (
            <div 
              key={item.item_id} 
              className={`glass-card rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isCompleted 
                  ? 'border-white/5 opacity-60 bg-white/[0.02]' 
                  : 'border-white/10 hover:border-white/20 hover:-translate-y-0.5'
              }`}
            >
              <div>
                {/* Header with Checkbox, Title & Priority */}
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleAction(item.item_id)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-500"
                    title="Toggle completed"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.task}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider flex-shrink-0 ${getPriorityBadge(item.priority)}`}>
                    {item.priority || 'medium'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 ml-7 mb-4">
                  Requested by: <strong className="text-slate-200">{item.detected_sender}</strong>
                </div>
              </div>

              {/* Footer with Due Date and Gmail Link */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs ml-7">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Due: {item.due_date || 'No hard deadline'}</span>
                </div>

                <a 
                  href={item.gmail_link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <span>Open Thread</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
