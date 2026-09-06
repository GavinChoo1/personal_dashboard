import React, { useState } from 'react';
import { Sparkles, Send, ExternalLink, HelpCircle } from 'lucide-react';

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
    <div className="animate-fade-in search-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="digest-tag" style={{ marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> Gemini Semantic Search
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>
          Ask Your Gmail Archive
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem' }}>
          Ask natural language questions about your travel, invoices, work deliverables, and contacts.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.25rem' }}>
        <div className="search-box-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="e.g. When did my Netflix renew? or What's on my to-do list?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-primary"
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.55rem 1rem' }}
            disabled={isAsking || !query.trim()}
          >
            <Send size={15} />
            <span>{isAsking ? 'Thinking...' : 'Ask'}</span>
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            className="btn-secondary"
            onClick={() => handleSuggestion(s)}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Answer Display */}
      {answerData && (
        <div className="digest-card" style={{ border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--purple-ai)', marginBottom: '0.85rem' }}>
            <Sparkles size={18} />
            <span>Answer</span>
          </div>

          <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#f8fafc', marginBottom: '1.5rem' }}>
            {answerData.answer}
          </div>

          {answerData.relevant_emails && answerData.relevant_emails.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Referenced Threads
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {answerData.relevant_emails.map((ref, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      padding: '0.85rem 1rem', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ref.subject}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        From: {ref.sender} • {ref.snippet}
                      </div>
                    </div>

                    <a 
                      href={`https://mail.google.com/mail/u/0/#all/${ref.thread_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link-gmail"
                      style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}
                    >
                      <span>View in Gmail</span>
                      <ExternalLink size={12} />
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
