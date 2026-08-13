import React, { useState } from 'react';
import { X, Bug, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import './Modals.css';

interface ApiSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSandboxModal: React.FC<ApiSandboxModalProps> = ({ isOpen, onClose }) => {
  const [testEndpoint, setTestEndpoint] = useState<string>('course-data');
  const [testResult, setTestResult] = useState<{ status: number | string; data: any; time: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const runTestCall = async (endpoint: string) => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`https://syncsphere-hiv6.onrender.com/assignment/${endpoint}`, {
        method: 'GET',
      });
      const time = Math.round(performance.now() - start);
      let data;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }
      setTestResult({ status: res.status, data, time });
    } catch (err: any) {
      const time = Math.round(performance.now() - start);
      setTestResult({ status: 'Network Error', data: err.message, time });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Bug size={20} className="modal-icon warning" />
            <h3>API Sandbox & Flakiness Inspector</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            The assignment endpoints (<code>/assignment/course-data</code> and <code>/assignment/country-code</code>) intentionally fail on roughly 1 in 3 requests. You can test live calls directly from this panel:
          </p>

          <div className="sandbox-controls">
            <div className="sandbox-btn-group">
              <button 
                className={`sandbox-btn ${testEndpoint === 'course-data' ? 'active' : ''}`}
                onClick={() => { setTestEndpoint('course-data'); runTestCall('course-data'); }}
                disabled={isLoading}
              >
                <span>Test /course-data</span>
              </button>
              <button 
                className={`sandbox-btn ${testEndpoint === 'country-code' ? 'active' : ''}`}
                onClick={() => { setTestEndpoint('country-code'); runTestCall('country-code'); }}
                disabled={isLoading}
              >
                <span>Test /country-code</span>
              </button>
            </div>

            <button 
              className="sandbox-run-btn"
              onClick={() => runTestCall(testEndpoint)}
              disabled={isLoading}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Calling API...' : 'Ping Endpoint'}</span>
            </button>
          </div>

          {testResult && (
            <div className="sandbox-result-box">
              <div className="result-header">
                <div className="result-status-badge">
                  {testResult.status === 200 ? (
                    <span className="badge-pill success">
                      <CheckCircle2 size={13} /> HTTP 200 OK
                    </span>
                  ) : (
                    <span className="badge-pill error">
                      <ShieldAlert size={13} /> HTTP {testResult.status} (Simulated Flakiness)
                    </span>
                  )}
                  <span className="latency-pill">{testResult.time}ms</span>
                </div>
              </div>
              <pre className="result-json">
                <code>{JSON.stringify(testResult.data, null, 2)}</code>
              </pre>
            </div>
          )}

          <div className="sandbox-info-card">
            <h4>Edge Case Handling Breakdown:</h4>
            <ul>
              <li><strong>Flaky 404/500 on Course Data:</strong> Triggers modern error screen with explanation & <em>Retry</em> button.</li>
              <li><strong>Flaky 404/500 on Country Code:</strong> Gracefully falls back to default currency without failing or crashing courses.</li>
              <li><strong>Zero Results (<code>[]</code>):</strong> Renders tailored empty-state with reload button.</li>
              <li><strong>Currency Unit Math:</strong> <code>199900</code> paise correctly renders as <strong>₹1,999</strong> (not ₹1,99,900) & <code>3999</code> cents as <strong>$39.99</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
