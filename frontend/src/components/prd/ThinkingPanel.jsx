import React from 'react';

export default function ThinkingPanel({ thinking, phase, showThinking, onToggle }) {
  if (!thinking) return null;

  const isActive = phase === 'thinking';

  return (
    <div className="thinking-panel">
      <div className="thinking-head">
        <div className="thinking-label">
          {isActive ? (
            <>
              <span className="spinner-xs spinner-warn" />
              AI Reasoning…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              AI Reasoning (used as context)
            </>
          )}
        </div>
        <button className="btn-ghost btn-sm" onClick={onToggle}>
          {showThinking ? 'Hide' : 'Show'}
        </button>
      </div>

      {showThinking && (
        <div className="thinking-body">
          <pre>{thinking}</pre>
        </div>
      )}
    </div>
  );
}
