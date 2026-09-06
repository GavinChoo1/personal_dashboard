import React, { useState } from 'react';
import { Search, ExternalLink, Paperclip, Star, X } from 'lucide-react';

export default function EmailsView({ emailsData, onSearchChange, onCategoryChange, selectedCategory, onSelectEmail, selectedEmail, onCloseModal }) {
  const { total = 0, items = [] } = emailsData || {};
  const categories = ['All', 'Primary', 'Finance', 'Updates', 'Newsletters', 'Promotions'];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
              Indexed Emails ({total})
            </h2>
            {items.length > 0 && items[0]?.storage_source && (
              <span 
                style={{ 
                  fontSize: '0.72rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  color: '#10b981', 
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600
                }}
              >
                {items[0].storage_source}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Live external table querying over Google Drive emails (NDJSON / Parquet).
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-box-wrap" style={{ marginBottom: '1.5rem' }}>
        <Search size={18} color="var(--text-dim)" style={{ marginLeft: '6px' }} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Filter by subject, sender, or keywords..."
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Emails Table */}
      <div className="metric-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}></th>
                <th>Sender</th>
                <th>Subject & Snippet</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr 
                  key={item.message_id} 
                  style={{ cursor: 'pointer', background: item.is_unread ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}
                  onClick={() => onSelectEmail(item.message_id)}
                >
                  <td style={{ textAlign: 'center' }}>
                    {item.is_unread && (
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gmail-red)' }} title="Unread" />
                    )}
                  </td>
                  <td style={{ fontWeight: item.is_unread ? 700 : 500, whiteSpace: 'nowrap' }}>
                    {item.sender_name || item.sender_email}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: item.is_unread ? 700 : 500 }}>{item.subject}</span>
                      {item.has_attachments && <Paperclip size={12} color="var(--text-dim)" />}
                      {item.is_starred && <Star size={12} color="var(--google-yellow)" fill="var(--google-yellow)" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.snippet}
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge cat-${item.category?.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(item.internal_date).toLocaleDateString()}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                    <a 
                      href={item.gmail_link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="link-gmail"
                    >
                      <span>Gmail</span>
                      <ExternalLink size={12} />
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
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedEmail.subject}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  From: <strong>{selectedEmail.sender_name}</strong> ({selectedEmail.sender_email})
                </div>
              </div>
              <button 
                className="btn-secondary" 
                onClick={onCloseModal} 
                style={{ padding: '0.4rem', border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span className={`category-badge cat-${selectedEmail.category?.toLowerCase()}`}>
                  {selectedEmail.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '0.2rem 0.5rem' }}>
                  Received: {new Date(selectedEmail.internal_date).toLocaleString()}
                </span>
              </div>

              <div style={{ lineHeight: 1.6, color: '#e2e8f0' }}>
                {selectedEmail.body_plain || selectedEmail.snippet}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={onCloseModal}>
                Close
              </button>
              <a 
                href={selectedEmail.gmail_link} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary"
              >
                <span>Open in Gmail Web</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
