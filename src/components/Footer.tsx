import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-section">
      <div className="container footer-container">
        
        {/* Brand / Logo */}
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>Skillpath</span>
          </div>
        </div>

        {/* Three Links */}
        <nav className="footer-nav" aria-label="Footer Navigation">
          <a href="#courses" className="footer-link">Courses</a>
          <a href="#terms" className="footer-link" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Standard creator platform terms apply.'); }}>Terms of Service</a>
          <a href="#privacy" className="footer-link" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: We do not track or sell learner data.'); }}>Privacy Policy</a>
        </nav>

        {/* Copyright Line */}
        <div className="footer-copyright">
          © {new Date().getFullYear()} Skillpath, Inc. All rights reserved.
        </div>

      </div>
    </footer>
  );
};
