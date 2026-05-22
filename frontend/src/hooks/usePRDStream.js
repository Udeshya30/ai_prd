import { useRef, useState } from 'react';
import { API_URL, INITIAL_FORM, initSections, SECTION_TITLES } from '../constants/prd';

export function usePRDStream() {
  const [formData, setFormData]         = useState(INITIAL_FORM);
  const [file, setFile]                 = useState(null);
  const [phase, setPhase]               = useState('idle');
  const [thinking, setThinking]         = useState('');
  const [showThinking, setShowThinking] = useState(false);
  const [sections, setSections]         = useState(initSections());
  const [prd, setPrd]                   = useState('');
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState(false);
  const abortRef                        = useRef(null);

  const isLoading = phase === 'thinking' || phase === 'writing';

  const resetState = () => {
    setPrd('');
    setError('');
    setThinking('');
    setShowThinking(false);
    setSections(initSections());
    setCopied(false);
  };

  const markSection = (title, status) =>
    setSections((prev) => prev.map((s) => (s.title === title ? { ...s, status } : s)));

  const runStream = async (url, bodyObj) => {
    resetState();
    setPhase('thinking');

    const controller = new AbortController();
    abortRef.current = controller;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Network error.');
      setPhase('idle');
      return;
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      setError(json.detail || `HTTP ${res.status}`);
      setPhase('idle');
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') { setPhase('done'); return; }

          let evt;
          try { evt = JSON.parse(payload); } catch { continue; }

          if (evt.error)                    { setError(evt.error); continue; }
          if (evt.type === 'thinking_start') setPhase('thinking');
          if (evt.type === 'thinking_token') setThinking((p) => p + evt.content);
          if (evt.type === 'section_start') {
            setPhase('writing');
            markSection(evt.section, 'active');
          }
          if (evt.type === 'token')         setPrd((p) => p + evt.content);
          if (evt.type === 'section_done')  markSection(evt.section, 'done');
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Stream interrupted.');
    } finally {
      setPhase((p) => (p !== 'idle' ? 'done' : 'idle'));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runStream(`${API_URL}/generate-prd/stream`, formData);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setPhase('idle');
  };

  const handleFileUpload = async () => {
    if (!file) return setError('Please select a file first.');
    resetState();
    setPhase('writing');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch(`${API_URL}/upload-requirements`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setPrd(data.prd || '');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setPhase('done');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prd], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${formData.project_name || 'prd'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSection = sections.find((s) => s.status === 'active');
  const doneCount     = sections.filter((s) => s.status === 'done').length;

  const progressLabel =
    phase === 'thinking' ? 'Reasoning about the project…' :
    phase === 'writing'  ? `Writing: ${activeSection?.title ?? '…'} (${doneCount}/${SECTION_TITLES.length})` :
    '';

  return {
    formData, setFormData,
    file, setFile,
    phase, isLoading,
    thinking, showThinking, setShowThinking,
    sections, prd,
    error, setError,
    copied, progressLabel,
    handleSubmit, handleCancel,
    handleFileUpload, handleCopy, handleDownload,
  };
}
