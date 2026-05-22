import React from 'react';
import { SECTION_TITLES } from '../../constants/prd';

function StepIcon({ status }) {
  if (status === 'done') {
    return (
      <span className="step-icon step-done">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="step-icon step-active">
        <span className="pulse-ring" />
      </span>
    );
  }
  return <span className="step-icon step-pending" />;
}

export default function SectionProgress({ sections, phase, progressLabel }) {
  const doneCount = sections.filter((s) => s.status === 'done').length;
  const pct       = Math.round((doneCount / SECTION_TITLES.length) * 100);
  const isActive  = phase === 'thinking' || phase === 'writing';

  return (
    <div className="glass-card">
      <div className="card-head">
        <h2 className="card-title">
          <span className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6"  y1="20" x2="6"  y2="14" />
            </svg>
          </span>
          Generation Progress
        </h2>
        <span className={`phase-pill ${isActive ? 'pill-active' : phase === 'done' ? 'pill-done' : 'pill-idle'}`}>
          {isActive && <span className="spinner-xs" />}
          {phase === 'done'     ? 'Complete'  :
           phase === 'thinking' ? 'Reasoning' :
           phase === 'writing'  ? 'Writing'   : 'Idle'}
        </span>
      </div>

      <div className="card-body">
        {(phase === 'writing' || phase === 'done') && (
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-label">{doneCount} / {SECTION_TITLES.length}</span>
          </div>
        )}

        {progressLabel && (
          <p className="progress-status">{progressLabel}</p>
        )}

        <ul className="section-list">
          {sections.map((s) => (
            <li
              key={s.title}
              className={`section-item ${s.status === 'done' ? 'item-done' : s.status === 'active' ? 'item-active' : ''}`}
            >
              <StepIcon status={s.status} />
              <span>{s.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
