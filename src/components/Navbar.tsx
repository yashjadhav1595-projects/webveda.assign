import React from 'react';
import { Code2, Bug } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onOpenCodeModal: () => void;
  onOpenSandboxModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCodeModal, onOpenSandboxModal }) => {
  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        
        {/* Logo */}
        <a href="#" className="navbar-brand">
          <div className="navbar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="navbar-brand-name">Skillpath</span>
          <span className="navbar-badge">Framer Ready</span>
        </a>

        {/* Action Controls & Dev Utilities */}
        <div className="navbar-actions">
          <button 
            className="navbar-btn dev-sandbox-btn" 
            onClick={onOpenSandboxModal}
            title="Open API Edge Case Simulator to test 404, 500, and empty states"
          >
            <Bug size={15} />
            <span className="btn-label-desktop">API Simulator</span>
          </button>

          <button 
            className="navbar-btn framer-code-btn" 
            onClick={onOpenCodeModal}
            title="View and copy Framer code component"
          >
            <Code2 size={15} />
            <span>Framer Code</span>
          </button>
        </div>

      </div>
    </header>
  );
};
