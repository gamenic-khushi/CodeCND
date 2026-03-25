export default function FileList({
  lang, t,
  selectedCompany, selectedProduct, selectedFolder,
  fileRows, fileSearch, setFileSearch, fileCopied,
  onDeleteRow, onCopyFileRef,
  onOpenEditor, onOpenUpload,
  onNavToCompany, onNavToProduct,
}) {
  const filteredFiles = fileRows
    .filter(r => (lang === 'en' ? r.en : r.jp).toLowerCase().includes(fileSearch.toLowerCase()));

  return (
    <div className="page company-page">
      <div className="page-toolbar">
        <div className="toolbar-left">
          <button className="file-icon-btn" title="Open Editor" onClick={onOpenEditor}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
          <button className="file-icon-btn" title="Add Document" onClick={onOpenUpload}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
          </button>
          <span className="toolbar-breadcrumb">
            <span className="toolbar-crumb-link" onClick={onNavToCompany}>
              {selectedCompany ? (lang === 'en' ? selectedCompany.en : selectedCompany.jp) : ''}
            </span>
            <span className="toolbar-crumb-sep">›</span>
            <span className="toolbar-crumb-link" onClick={onNavToProduct}>
              {selectedProduct ? (lang === 'en' ? selectedProduct.en : selectedProduct.jp) : ''}
            </span>
            <span className="toolbar-crumb-sep">›</span>
            <span className="toolbar-crumb-current">
              {typeof selectedFolder === 'object' && selectedFolder
                ? (lang === 'en' ? selectedFolder.en : selectedFolder.jp)
                : selectedFolder}
            </span>
          </span>
        </div>
        <div className="search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder={t.searchHere}
            value={fileSearch} onChange={e => setFileSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card ft-table">
        <div className="ft-thead">
          <div className="ft-th ft-col-check" />
          <div className="ft-th ft-col-ref">{t.referenceId}</div>
          <div className="ft-th ft-col-type">{t.fileType}</div>
          <div className="ft-th ft-col-name">{t.fileName}</div>
          <div className="ft-th ft-col-preview">{t.preview}</div>
          <div className="ft-th ft-col-actions" />
        </div>
        <div className="table-body">
        {filteredFiles.map(row => (
          <div key={row.id} className="ft-row">
            <div className="ft-cell ft-col-check">
              <input type="checkbox" className="ft-checkbox" />
            </div>
            <div className="ft-cell ft-col-ref">
              <span className="ft-ref-id">{row.refId}</span>
              <button className="pr-copy-btn" onClick={() => onCopyFileRef(row.id, row.refId)}>
                {fileCopied === row.id ? '✓' : '📋'}
              </button>
            </div>
            <div className="ft-cell ft-col-type">
              <span className={`ft-type-badge ft-type-${row.type.toLowerCase()}`}>
                {row.type === 'File' ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
                {row.type === 'File' ? t.typeFile : t.typeChat}
              </span>
            </div>
            <div className="ft-cell ft-col-name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" style={{flexShrink:0}}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="ft-file-name">{lang === 'en' ? row.en : row.jp}</span>
            </div>
            <div className="ft-cell ft-col-preview">
              <div className="ft-preview-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4c9d4" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
            </div>
            <div className="ft-cell ft-col-actions">
              <button className="ft-action-btn ft-action-clip" title="Attach" onClick={() => console.log('attach', row.refId)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <button className="ft-action-btn ft-action-doc" title="View document" onClick={() => console.log('document', row.refId)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </button>
              <button className="ft-action-btn ft-action-eye" title="Preview" onClick={() => console.log('preview', row.refId)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button className="ft-action-btn ft-action-play" title="Open editor" onClick={onOpenEditor}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </button>
              <button className="ft-action-btn ft-action-delete" title="Delete"
                onClick={() => { if (window.confirm(`Delete "${lang === 'en' ? row.en : row.jp}"?`)) onDeleteRow(row.id); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
