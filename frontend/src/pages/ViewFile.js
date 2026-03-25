import { useState } from 'react';

export default function ViewFile({ lang, t, file, folder, onBack }) {
  const [prettyPrint, setPrettyPrint] = useState(false);

  const fileName  = lang === 'en' ? file?.en  : file?.jp;
  const folderName = lang === 'en' ? folder?.en : folder?.jp;

  const fileContent = `{"message":"The requested file could not be found.","code":404,"type":"storage_file_not_found","version":"1.9.0"}`;

  const displayContent = prettyPrint
    ? (() => { try { return JSON.stringify(JSON.parse(fileContent), null, 2); } catch { return fileContent; } })()
    : fileContent;

  function handleOpenNewTab() {
    window.open('about:blank', '_blank');
  }

  function handleDownload() {
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = (fileName || 'file') + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page vf-page">

      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>{t.back}</button>
        <span className="ac-title">{t.viewFile}</span>
      </div>

      <div className="vf-body">

          {/* Left panel */}
          <div className="vf-left-panel">

            <div className="vf-field">
              <label className="vf-label">{t.folder}</label>
              <input className="vf-input" readOnly value={folderName || '—'} />
            </div>

            <div className="vf-field">
              <label className="vf-label">{t.name}</label>
              <input className="vf-input" readOnly value={fileName || '—'} />
            </div>

          </div>

          {/* Right panel */}
          <div className="vf-right-panel">

            <div className="vf-pretty-bar">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prettyPrint}
                  onChange={e => setPrettyPrint(e.target.checked)}
                />
                {t.prettyPrint}
              </label>
            </div>

            <div className="vf-content-area">
              <pre className="vf-content-text">{displayContent}</pre>
            </div>

            <div className="vf-btn-row">
              <button className="vf-btn" onClick={handleOpenNewTab}>{t.openInNewTab}</button>
              <button className="vf-btn" onClick={handleDownload}>{t.downloadFile}</button>
            </div>

          </div>

      </div>

    </div>
  );
}
