import { useState, useRef } from 'react';

export default function AddChat({ lang, t, folders, onBack, onSave }) {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [name, setName]                     = useState('');
  const [prompt, setPrompt]                 = useState('');
  const [chatText, setChatText]             = useState('');
  const [generating, setGenerating] = useState(false);
  const [toast, setToast]           = useState(false);
  const toastTimerRef               = useRef(null);

  const folderList = folders && folders.length > 0 ? folders : [];

  function showErrorToast() {
    setToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(false), 3000);
  }

  function handleGenerate() {
    if (!prompt.trim()) {
      showErrorToast();
      return;
    }
    setGenerating(true);
  }

  function handleSave() {
    if (onSave) onSave({ selectedFolder, name, prompt });
  }

  return (
    <div className="ac2-page">

      {/* Header */}
      <div className="ac2-header">
        <button className="ac2-back-btn" onClick={onBack}>← {t.backBtn}</button>
        <span className="ac2-title">{t.addChat}</span>
      </div>

      {/* Two-panel body */}
      <div className="ac2-body">

        {/* LEFT PANEL */}
        <div className="ac2-left">

          {/* Folder */}
          <div className="ac2-field">
            <label className="ac2-label">
              {t.folder} <span className="ac2-required">*</span>
            </label>
            <select
              className="ac2-select"
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
            >
              <option value="" />
              {folderList.map((f, i) => (
                <option key={i} value={lang === 'en' ? f.en : f.jp}>
                  {lang === 'en' ? f.en : f.jp}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="ac2-field">
            <label className="ac2-label">
              {t.name} <span className="ac2-required">*</span>
            </label>
            <input
              className="ac2-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Prompt */}
          <div className="ac2-field ac2-field-grow">
            <div className="ac2-prompt-header">
              <label className="ac2-label">{t.prompt}</label>
              <button className="ac2-logs-btn">{t.generatedLogs}</button>
            </div>
            <textarea
              className="ac2-prompt-textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="ac2-right">

          {/* Empty content area */}
          <div className="ac2-content-area">
            <div className="ac2-arrows">
              <button className="ac2-arrow-btn" disabled>▲</button>
              <button className="ac2-arrow-btn" disabled>▼</button>
            </div>
          </div>

          {/* Settings icon row */}
          <div className="ac2-settings-row">
            <button className="ac2-settings-btn">⚙</button>
          </div>

          {/* Chat section */}
          <div className="ac2-chat-section">
            <label className="ac2-chat-label">{t.chat}</label>
            <textarea
              className="ac2-chat-textarea"
              value={chatText}
              onChange={e => setChatText(e.target.value)}
            />
          </div>

          {/* Generate button */}
          <div className="ac2-generate-wrap">
            <button className="ac2-generate-btn" onClick={handleGenerate}>
              {t.generate}
            </button>
          </div>

        </div>

      </div>

      {/* Save button outside both panels */}
      <div className="ac2-footer">
        <button className="ac2-footer-save-btn" onClick={handleSave}>{t.save}</button>
      </div>

      {/* Error toast */}
      {toast && (
        <div className="ac2-toast-error">
          <span className="ac2-toast-icon">!</span>
          <span className="ac2-toast-message">Please Enter the prompt first</span>
          <button className="ac2-toast-close" onClick={() => { setToast(false); clearTimeout(toastTimerRef.current); }}>✕</button>
        </div>
      )}

    </div>
  );
}
