import React, { useRef, useState } from 'react';

export default function FileUpload({ file, onFileChange, onUpload, isLoading }) {
  const inputRef   = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = ()  => setIsDragOver(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div className="glass-card">
      <div className="card-head">
        <h2 className="card-title">
          <span className="card-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          Upload Requirements
        </h2>
        <span className="tag">.txt · .docx</span>
      </div>
      <div className="card-body">
        <div
          className={`drop-zone${isDragOver ? ' drag-active' : ''}${file ? ' has-file' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.docx"
            style={{ display: 'none' }}
            onChange={(e) => onFileChange(e.target.files[0] || null)}
          />
          <div className="drop-zone-icon">
            {file ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>
          <div className="drop-zone-text">
            {file ? (
              <span className="file-selected">{file.name}</span>
            ) : (
              <>
                <span>Drop file here or <em>browse</em></span>
                <small>.txt or .docx accepted</small>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn-primary btn-block"
          onClick={onUpload}
          disabled={isLoading || !file}
        >
          {isLoading ? (
            <><span className="spinner-xs" /> Processing…</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Upload &amp; Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
