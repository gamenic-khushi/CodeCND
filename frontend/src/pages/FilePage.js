import { useRef, useEffect } from 'react';

export default function FilePage({
  lang, t,
  folders, selectedFolder, setSelectedFolder,
  fileName, setFileName,
  promptText, setPromptText,
  chatInput, setChatInput,
  messages, isLoading, copied,
  onFileSave, onCopy, onChatKey, onGenerate,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function formatBubble(text) {
    return text.split('\n').map(l => l.trim() ? `· ${l}` : '').join('\n').trim();
  }

  return (
    <div className="page file-page">
      <aside className="left-panel">
        <div className="field">
          <label className="field-label">{t.folder}</label>
          <div className="select-wrap">
            <select className="field-select" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
              <option value="">{t.folder}…</option>
              {folders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.fileNameLabel}</label>
          <input className="field-input" type="text" placeholder={t.fileNameLabel}
            value={fileName} onChange={e => setFileName(e.target.value)} />
        </div>
        <div className="field field-grow">
          <label className="field-label">{t.prompt}</label>
          <textarea className="field-textarea" placeholder={t.enterPrompt}
            value={promptText} onChange={e => setPromptText(e.target.value)} />
        </div>
        <button className="btn-save" onClick={onFileSave} disabled={!promptText.trim()}>
          {t.save}
        </button>
      </aside>
      <main className="right-panel">
        <div className="messages-area">
          {messages.length === 0 && !isLoading && (
            <div className="empty-state">
              <p>{t.reGenerate}</p>
            </div>
          )}
          {messages.map(msg =>
            msg.role === 'user' ? (
              <div key={msg.id} className="bubble-row">
                <div className="user-bubble">{formatBubble(msg.content)}</div>
              </div>
            ) : (
              <div key={msg.id} className={`ai-block${msg.isError ? ' error' : ''}`}>
                <p className="ai-text">{msg.content}</p>
                {!msg.isError && (
                  <button className="copy-btn" onClick={() => onCopy(msg.id, msg.content)}>
                    {copied === msg.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                )}
              </div>
            )
          )}
          {isLoading && <div className="spinner-row"><div className="spinner" /></div>}
          <div ref={bottomRef} />
        </div>
        <div className="chat-section">
          <span className="chat-label">{t.chat}</span>
          <input className="chat-input" type="text" placeholder={t.askAnything}
            value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={onChatKey} />
        </div>
        <div className="generate-wrap">
          <button className="btn-generate" onClick={onGenerate}
            disabled={!chatInput.trim() || isLoading}>
            {isLoading ? `${t.generate}…` : t.generate}
          </button>
        </div>
      </main>
    </div>
  );
}
