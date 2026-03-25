import { useState, useRef } from 'react';

export default function AddFile({ lang, t, folders, onBack, onUpload }) {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [dragOver, setDragOver]             = useState(false);
  const [files, setFiles]                   = useState([]);
  const fileInputRef                        = useRef(null);

  const folderList = folders && folders.length > 0 ? folders : [];

  function handleFiles(incoming) {
    setFiles(prev => [...prev, ...Array.from(incoming)]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleUpload() {
    if (onUpload) onUpload({ selectedFolder, files });
  }

  return (
    <div className="af-page">

      {/* Header */}
      <div className="af-header">
        <button className="af-back-btn" onClick={onBack}>← {t.backBtn}</button>
        <span className="af-title">{t.addFile}</span>
      </div>

      {/* Body */}
      <div className="af-body">

        {/* LEFT PANEL + UPLOAD BUTTON stacked */}
        <div className="af-left-col">

          <div className="af-left">

            {/* Folder */}
            <div className="af-field">
              <label className="af-label">
                {t.folder} <span className="af-required">*</span>
              </label>
              <select
                className="af-select"
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

            {/* Upload Files */}
            <div className="af-field">
              <label className="af-label">{t.uploadFiles}</label>

              <div
                className={`af-dropzone${dragOver ? ' af-dropzone-active' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                </svg>
                <p className="af-dropzone-title">{t.dragDrop}</p>
                <p className="af-dropzone-sub">{t.anyFileType}</p>
                {files.length > 0 && (
                  <p className="af-dropzone-count">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />
            </div>

          </div>

          {/* Upload button below left panel */}
          <div className="af-upload-btn-row">
            <button className="af-upload-btn" onClick={handleUpload}>{t.upload}</button>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="af-right">
          <span className="af-right-placeholder">Upload files to preview</span>
        </div>

      </div>
    </div>
  );
}
