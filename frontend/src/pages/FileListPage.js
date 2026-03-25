import { useState, useRef, useEffect } from 'react';

export default function FileListPage({
  lang, t,
  companies, products, folderRows, fileRows,
  onAddFolder, onUpload, onAddFile, showToast, onDeleteFile, onDuplicateFile, onViewFile, onEditFile,
}) {
  const [level, setLevel]             = useState('companies');
  const [fileCompany, setFileCompany] = useState(null);
  const [fileProduct, setFileProduct] = useState(null);
  const [fileFolder, setFileFolder]   = useState(null);
  const [search, setSearch]           = useState('');

  const [fileChecked, setFileChecked] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState(null);
  const [linkedId, setLinkedId]       = useState(null);
  const headerCheckRef = useRef(null);

  function goTo(newLevel, overrides = {}) {
    setSearch('');
    setFileChecked(new Set());
    if ('company' in overrides) setFileCompany(overrides.company);
    if ('product' in overrides) setFileProduct(overrides.product);
    if ('folder'  in overrides) setFileFolder(overrides.folder);
    setLevel(newLevel);
  }

  // ── Rows ──────────────────────────────────────────────────
  let rows = [];
  let headerLabel = '';
  const q = search.toLowerCase();

  if (level === 'companies') {
    rows = companies.filter(c => (lang === 'en' ? c.en : c.jp || '').toLowerCase().includes(q));
    headerLabel = t.companyNameCol;
  } else if (level === 'products') {
    rows = products.filter(p =>
      (p.companyId === fileCompany?.id || p._awid === fileCompany?._awid) &&
      (lang === 'en' ? p.en : p.jp || '').toLowerCase().includes(q)
    );
    headerLabel = t.productName;
  } else if (level === 'folders') {
    const pName = lang === 'en' ? fileProduct?.en : fileProduct?.jp;
    rows = folderRows.filter(f =>
      (lang === 'en' ? f.productEn : f.productJp) === pName &&
      (lang === 'en' ? f.en : f.jp || '').toLowerCase().includes(q)
    );
    headerLabel = t.folderName;
  } else {
    rows = fileRows.filter(f => (lang === 'en' ? f.en : f.jp || '').toLowerCase().includes(q));
  }

  function handleSimpleRowClick(row) {
    if      (level === 'companies') goTo('products', { company: row });
    else if (level === 'products')  goTo('folders',  { product: row });
    else if (level === 'folders')   goTo('files',    { folder: row });
  }

  // ── File-level checkbox ───────────────────────────────────
  const allChecked  = rows.length > 0 && rows.every(f => fileChecked.has(f.id));
  const someChecked = rows.some(f => fileChecked.has(f.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckRef.current) headerCheckRef.current.indeterminate = someChecked;
  }, [someChecked]);

  function toggleAll() {
    if (allChecked) setFileChecked(new Set());
    else setFileChecked(new Set(rows.map(f => f.id)));
  }
  function toggleCheck(id) {
    setFileChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Delete modal ──────────────────────────────────────────
  const isBulk     = deleteModal === 'bulk';
  const modalLabel = deleteModal && !isBulk
    ? (lang === 'en' ? deleteModal.en : deleteModal.jp)
    : `${fileChecked.size} ${lang === 'en' ? 'files' : '件のファイル'}`;

  function confirmDelete() {
    if (isBulk) {
      onDeleteFile(Array.from(fileChecked));
      setFileChecked(new Set());
    } else {
      onDeleteFile(deleteModal.id);
    }
    setDeleteModal(null);
    showToast(t.deleted);
  }

  // ── Breadcrumb names ──────────────────────────────────────
  const showBreadcrumb = level !== 'companies';
  const companyName = fileCompany ? (lang === 'en' ? fileCompany.en : fileCompany.jp) : '';
  const productName = fileProduct ? (lang === 'en' ? fileProduct.en : fileProduct.jp) : '';
  const folderName  = fileFolder  ? (lang === 'en' ? fileFolder.en  : fileFolder.jp)  : '';

  // ── Icons (reusable snippets) ─────────────────────────────
  const IconCopy = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
  const IconDoc = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
  const IconFile = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
  const IconChat = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  return (
    <div className="page company-page">

      {/* ── Toolbar ── */}
      <div className="pl-toolbar">
        <div className="pl-toolbar-left" style={{ gap: '8px' }}>

          {/* Add Folder */}
          <button className="fll-add-btn" title={t.addFolder} onClick={onAddFolder}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Upload File */}
          <button className="fll-add-btn" title={t.upload} onClick={onAddFile}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Breadcrumb pills */}
          {showBreadcrumb && (
            <div className="fll-breadcrumb-trail">
              {/* Company pill */}
              <div className="fll-bc-pill fll-bc-pill-link" onClick={() => goTo(level === 'products' ? 'companies' : 'products')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>{companyName}</span>
              </div>

              {/* Product pill */}
              {(level === 'folders' || level === 'files') && (
                <>
                  <span className="fll-bc-sep">›</span>
                  <div className="fll-bc-pill fll-bc-pill-link" onClick={() => goTo(level === 'files' ? 'folders' : 'products')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 22 12 12 22 2 12"/>
                    </svg>
                    <span>{productName}</span>
                  </div>
                </>
              )}

              {/* Folder pill — current level, not clickable */}
              {level === 'files' && (
                <>
                  <span className="fll-bc-sep">›</span>
                  <div className="fll-bc-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{folderName}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pl-toolbar-right">
          <div className="cl-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {level === 'files' ? (

        /* Files-level detailed table */
        <div className="cl-table-card">
          <div className="flt-thead">
            <div className="flt-th flt-th-check">
              <input type="checkbox" className="cl-checkbox" ref={headerCheckRef}
                checked={allChecked} onChange={toggleAll} />
            </div>
            <div className="flt-th flt-th-refid">Reference ID</div>
            <div className="flt-th flt-th-name">filename</div>
            <div className="flt-th flt-th-type">Type</div>
            <div className="flt-th flt-th-preview">Preview</div>
            <div className="flt-th flt-th-actions" />
          </div>

          <div className="flt-tbody">
            {rows.map(file => (
              <div key={file.id} className="flt-row">

                <div className="flt-cell flt-cell-check">
                  <input type="checkbox" className="cl-checkbox"
                    checked={fileChecked.has(file.id)}
                    onChange={() => toggleCheck(file.id)}
                    onClick={e => e.stopPropagation()} />
                </div>

                <div className="flt-cell flt-cell-refid">
                  <span className="flt-refid-text">{file.refId}</span>
                  <button className="cl-icon-btn" title="Copy ID"
                    onClick={() => navigator.clipboard.writeText(file.refId)}>
                    {IconCopy}
                  </button>
                </div>

                <div className="flt-cell flt-cell-name">
                  {lang === 'en' ? file.en : file.jp}
                </div>

                <div className="flt-cell flt-cell-type">
                  <span className={file.type === 'File' ? 'flt-badge-file' : 'flt-badge-chat'}>
                    {file.type === 'File' ? IconFile : IconChat}
                    {file.type === 'File' ? t.typeFile : t.typeChat}
                  </span>
                </div>

                <div className="flt-cell flt-cell-preview">
                  <div className="flt-preview">{IconDoc}</div>
                </div>

                <div className="action-icons flt-cell-actions">
                  {/* Link */}
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#4dd9d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    title="Link" style={{ cursor: 'pointer', border: linkedId === file.id ? '1.5px solid #1a1a2e' : '1.5px solid transparent', borderRadius: '6px', padding: '4px', boxSizing: 'content-box' }}
                    onClick={() => { navigator.clipboard.writeText(lang === 'en' ? file.en : file.jp); setLinkedId(file.id); showToast(t.linkCopied); setTimeout(() => setLinkedId(null), 3000); }}>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  {/* Duplicate */}
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ cursor: 'pointer' }} onClick={() => { onDuplicateFile(file); showToast(t.duplicated); }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {/* View */}
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#4dd9d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    title="View" style={{ cursor: 'pointer' }} onClick={() => onViewFile(file, fileFolder)}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {/* Edit — Chat only */}
                  {file.type === 'Chat' && (
                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      title="Edit" style={{ cursor: 'pointer' }} onClick={() => onEditFile(file, fileFolder)}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  )}
                  {/* Delete */}
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    title={t.delete} style={{ cursor: 'pointer' }} onClick={() => setDeleteModal(file)}>
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </div>

              </div>
            ))}
            {rows.length === 0 && (
              <div className="flt-row" style={{ color: '#9098a9', cursor: 'default' }}>—</div>
            )}
          </div>
        </div>

      ) : (

        /* Company / Product / Folder simple list */
        <div className="cl-table-card">
          <div className="fll-thead">
            <span className="fll-col-header">{headerLabel}</span>
          </div>
          <div className="fll-tbody">
            {rows.map((row, i) => (
              <div key={row.id ?? i} className="fll-row" onClick={() => handleSimpleRowClick(row)}>
                {lang === 'en' ? row.en : row.jp}
              </div>
            ))}
            {rows.length === 0 && (
              <div className="fll-row" style={{ color: '#9098a9', cursor: 'default' }}>—</div>
            )}
          </div>
        </div>

      )}

      {/* ── Bulk action bar (files level) ── */}
      {level === 'files' && fileChecked.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-count">{fileChecked.size}</span>
          <span className="bulk-selected-text">{t.selected}</span>
          <button className="bulk-cancel-btn" onClick={() => setFileChecked(new Set())}>{t.cancel}</button>
          <button className="bulk-delete-btn" onClick={() => setDeleteModal('bulk')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {t.delete}
          </button>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap">
              <div className="modal-icon-inner"><span className="modal-exclaim">!</span></div>
            </div>
            <div className="modal-title">{t.deleteConfirmation}</div>
            <div className="modal-desc">
              {t.deleteMessage} <strong>{modalLabel}</strong>? {t.deleteWarning}
            </div>
            <div className="modal-btn-row">
              <button className="modal-btn-cancel" onClick={() => setDeleteModal(null)}>{t.cancel}</button>
              <button className="modal-btn-delete" onClick={confirmDelete}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status bar ── */}
      <div className="fll-status-bar">
        showing {level === 'files' ? rows.length : 0} of {fileRows.length} Files
      </div>

    </div>
  );
}
