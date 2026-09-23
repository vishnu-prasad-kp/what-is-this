import React from 'react';
import { Eye, Smartphone } from 'lucide-react';

export default function Navbar({ status, onHomeClick }) {
  const isLive = status?.has_groq_key;

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand-logo" onClick={onHomeClick} role="button" tabIndex={0} id="nav-brand-logo">
          <div className="brand-icon">
            <Eye size={22} color="#fff" />
          </div>
          <span className="brand-gradient-text">What Is This?</span>
        </div>

        <div className="nav-badges">
          <a
            href="/download-apk"
            className="apk-download-btn"
            download="what-is-this-app.apk"
            id="download-apk-btn"
            title="Download Android APK"
          >
            <Smartphone size={15} />
            <span>Download APK</span>
          </a>

          {status ? (
            <div 
              className={`status-badge ${isLive ? 'live' : 'demo'}`} 
              title={isLive ? `Live Groq Vision: ${status.model}` : 'Demo Simulation Mode (Add GROQ_API_KEY in backend/.env for live inference)'}
              id="ai-status-indicator"
            >
              <span className="status-dot"></span>
              <span>{isLive ? 'Groq Vision Live' : 'Demo Mode Active'}</span>
            </div>
          ) : (
            <div className="status-badge" id="ai-status-connecting">
              <span className="status-dot"></span>
              <span>Connecting...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
