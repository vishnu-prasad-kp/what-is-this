import React from 'react';
import { History, Trash2, ArrowUpRight, Clock } from 'lucide-react';

export default function RecentScans({ history, onSelectScan, onDeleteScan }) {
  if (!history || history.length === 0) {
    return null;
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <section className="history-section" id="recent-scans-section">
      <div className="section-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History size={20} color="var(--cyan-400)" />
          <h3 className="section-title">Recent Scans</h3>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {history.length} {history.length === 1 ? 'item' : 'items'} saved
        </span>
      </div>

      <div className="history-grid">
        {history.map((scan) => {
          const conf = (scan.confidence || 'medium').toLowerCase();
          return (
            <div
              key={scan.id}
              className="glass-card history-card"
              onClick={() => onSelectScan(scan.id)}
              id={`history-card-${scan.id}`}
            >
              <div className="history-thumb-frame">
                <img src={scan.image_url} alt={scan.name} loading="lazy" />
                <button
                  type="button"
                  className="btn-delete-scan"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete scan "${scan.name}"?`)) {
                      onDeleteScan(scan.id);
                    }
                  }}
                  title="Delete scan"
                  id={`btn-delete-${scan.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="history-card-body">
                <div className="history-card-title">{scan.name}</div>
                <div className="history-card-meta">
                  <span className={`confidence-pill ${conf}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                    {scan.confidence}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} />
                    {formatDate(scan.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
