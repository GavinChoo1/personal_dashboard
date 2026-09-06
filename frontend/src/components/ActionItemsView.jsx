import React, { useState } from 'react';
import { CheckSquare, Calendar, ExternalLink, Filter } from 'lucide-react';

export default function ActionItemsView({ actions, onToggleAction }) {
  const [filter, setFilter] = useState('all');

  const filtered = actions.filter(item => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
            Extracted Action Items & Deadlines
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Commitments, reply requests, and review tasks automatically identified from your email threads.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({actions.length})
          </button>
          <button 
            className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({actions.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({actions.filter(a => a.status === 'completed').length})
          </button>
        </div>
      </div>

      <div className="action-grid">
        {filtered.map(item => {
          const isCompleted = item.status === 'completed';
          return (
            <div key={item.item_id} className={`action-card ${isCompleted ? 'completed' : ''}`}>
              <div>
                <div className="action-header">
                  <input
                    type="checkbox"
                    className="action-checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleAction(item.item_id)}
                    title="Toggle completed"
                  />
                  <div className="action-task">{item.task}</div>
                  <span className={`priority-pill priority-${item.priority || 'medium'}`}>
                    {item.priority}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '1.9rem' }}>
                  Requested by: <strong style={{ color: 'var(--text-main)' }}>{item.detected_sender}</strong>
                </div>
              </div>

              <div className="action-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)' }}>
                  <Calendar size={13} />
                  <span>Due: {item.due_date || 'No hard deadline'}</span>
                </div>

                <a 
                  href={item.gmail_link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="link-gmail"
                >
                  <span>Open Thread</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
