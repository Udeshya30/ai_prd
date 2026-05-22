import React from 'react';
import { FIELD_LABELS } from '../../constants/prd';

const FIELD_PLACEHOLDERS = {
  project_name: 'e.g. TaskFlow — a project management SaaS',
  problem:      'What problem does this solve? Who is affected?',
  features:     'List the core features, one per line…',
  users:        'e.g. Small business owners, remote teams',
  goals:        'e.g. 1000 signups in 3 months, < 200ms API response',
};

export default function ProjectForm({ formData, onChange, onSubmit, onCancel, isLoading }) {
  return (
    <div className="glass-card">
      <div className="card-head">
        <h2 className="card-title">
          <span className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </span>
          Project Details
        </h2>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          {Object.entries(FIELD_LABELS).map(([field, label]) => (
            <div className="form-field" key={field}>
              <label htmlFor={field}>{label}</label>
              <textarea
                id={field}
                name={field}
                rows={field === 'features' ? 4 : 2}
                value={formData[field]}
                onChange={onChange}
                placeholder={FIELD_PLACEHOLDERS[field] || `Enter ${label.toLowerCase()}…`}
                required
              />
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-xs" />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate PRD
                </>
              )}
            </button>
            {isLoading && (
              <button type="button" className="btn-danger" onClick={onCancel}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
