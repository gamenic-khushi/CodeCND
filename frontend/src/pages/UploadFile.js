import { useRef } from 'react';

export default function UploadFile({
  lang, t,
  uploadFolder, setUploadFolder,
  uploadFile, setUploadFile,
  uploadStatus, setUploadStatus,
  isDragging, setIsDragging,
  uploadChat, setUploadChat,
  uploadOutput, uploadLoading,
  onUploadSubmit, onUploadGenerate,
  onBack,
}) {
  const uploadFileRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) { setUploadFile(file); setUploadStatus('idle'); }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setUploadFile(file); setUploadStatus('idle'); }
  }

  return (
    <div className="page upload-page">
      <div className="upload-header">
        <button className="upload-back-btn" onClick={onBack}>  {t.back}</button>
      </div>

      <div className="upload-body">
        <div className="upload-left">
          <div className="upload-field">
            <label className="upload-label">{t.folder}</label>
            <input
              className="upload-input"
              type="text"
              value={uploadFolder}
              onChange={e => setUploadFolder(e.target.value)}
            />
          </div>

          <div className="upload-field upload-field-grow">
            <label className="upload-label">{t.upload}</label>
            <div
              className={`upload-dropzone${isDragging ? ' dragging' : ''}`}
              onClick={() => uploadFileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {uploadFile ? (
                <p className="upload-filename">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</p>
              ) : (
                <>
                  <p className="upload-droptext">{t.dragDrop}</p>
                  <p className="upload-dropsubtext">{t.anyFileType}</p>
                </>
              )}
              <input ref={uploadFileRef} type="file" style={{display:'none'}} onChange={handleFileSelect} />
            </div>
          </div>

          <button
            className="upload-submit-btn"
            onClick={onUploadSubmit}
            disabled={!uploadFile || uploadStatus === 'uploading'}
          >
            {uploadStatus === 'uploading' ? 'Uploading…' : uploadStatus === 'done' ? 'Upload Complete ✅' : t.upload}
          </button>
        </div>

        <div className="upload-right">
          <div className="upload-output-area">
            {uploadLoading ? (
              <div className="spinner" />
            ) : uploadOutput ? (
              <p className="upload-output-text">{uploadOutput}</p>
            ) : (
              <p className="upload-output-ph">{t.reGenerate}</p>
            )}
          </div>
          <div className="upload-chat-section">
            <label className="upload-label">{t.chat}</label>
            <textarea
              className="upload-chat-textarea"
              placeholder={t.askAnything}
              value={uploadChat}
              onChange={e => setUploadChat(e.target.value)}
            />
          </div>
          <button
            className="upload-generate-btn"
            onClick={onUploadGenerate}
            disabled={!uploadChat.trim() || uploadLoading}
          >
            {uploadLoading ? `${t.generate}…` : t.generate}
          </button>
        </div>
      </div>
    </div>
  );
}
