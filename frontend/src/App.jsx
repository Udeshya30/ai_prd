import React from 'react';
import Header          from './components/layout/Header';
import ProjectForm     from './components/form/ProjectForm';
import FileUpload      from './components/form/FileUpload';
import SectionProgress from './components/prd/SectionProgress';
import ThinkingPanel   from './components/prd/ThinkingPanel';
import PRDOutput       from './components/prd/PRDOutput';
import { usePRDStream } from './hooks/usePRDStream';

export default function App() {
  const {
    formData, setFormData,
    file, setFile,
    phase, isLoading,
    thinking, showThinking, setShowThinking,
    sections, prd,
    error, setError,
    copied, progressLabel,
    handleSubmit, handleCancel,
    handleFileUpload, handleCopy, handleDownload,
  } = usePRDStream();

  const showProgress = isLoading || phase === 'done';

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="content-grid">

          {/* â”€â”€ Left column: inputs + progress â”€â”€ */}
          <div className="stack">
            <ProjectForm
              formData={formData}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
            <FileUpload
              file={file}
              onFileChange={setFile}
              onUpload={handleFileUpload}
              isLoading={isLoading}
            />
            {showProgress && (
              <SectionProgress
                sections={sections}
                phase={phase}
                progressLabel={progressLabel}
              />
            )}
          </div>

          {/* â”€â”€ Right column: output â”€â”€ */}
          <div className="stack">
            {error && (
              <div className="alert-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
                <button className="alert-close" onClick={() => setError('')} aria-label="Dismiss">&times;</button>
              </div>
            )}
            <ThinkingPanel
              thinking={thinking}
              phase={phase}
              showThinking={showThinking}
              onToggle={() => setShowThinking((v) => !v)}
            />
            <PRDOutput
              prd={prd}
              phase={phase}
              copied={copied}
              onCopy={handleCopy}
              onDownload={handleDownload}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

