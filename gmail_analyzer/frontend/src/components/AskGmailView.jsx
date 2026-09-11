import React, { useState } from 'react';
import { Sparkles, Send, ExternalLink, HelpCircle, Loader2 } from 'lucide-react';

export default function AskGmailView({ onAskQuestion, answerData, isAsking }) {
  const [query, setQuery] = useState('');

  const suggestions = [
    'When is my flight to San Francisco?',
    'What did David ask me to review?',
    'Show me all invoices from Google Cloud and AWS',
    'What monthly subscriptions are active?',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onAskQuestion(query.trim());
    }
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    onAskQuestion(s);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Gemini Semantic Search</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-display">
          Ask Your Gmail Archive
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Ask natural language questions about your travel, invoices, work deliverables, and contacts.
        </p>
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="e.g. When did my Netflix renew? or What's on my to-do list?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-28 py-3.5 rounded-2xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 shadow-xl transition-all"
          />
          <button 
            type="submit" 
            disabled={isAsking || !query.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
          >
            {isAsking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 justify-center pt-1">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestion(s)}
            className="px-3 py-1.5 rounded-full text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Answer Display */}
      {answerData && (
        <div className="glass-card rounded-2xl p-6 border border-purple-500/30 space-y-4 glow-purple animate-fade-in relative overflow-hidden">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Answer</span>
          </div>

          <div className="text-sm leading-relaxed text-slate-200">
            {answerData.answer}
          </div>

          {answerData.relevant_emails && answerData.relevant_emails.length > 0 && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Referenced Threads
              </h4>
              <div className="space-y-2">
                {answerData.relevant_emails.map((ref, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">{ref.subject}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        From: <span className="text-slate-300">{ref.sender}</span> • {ref.snippet}
                      </div>
                    </div>

                    <a 
                      href={`https://mail.google.com/mail/u/0/#all/${ref.thread_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap transition-colors"
                    >
                      <span>View in Gmail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
