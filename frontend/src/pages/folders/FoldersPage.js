import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';
import { CompanyIcon, ProductIcon, FolderIcon } from '../../icons';
import Sidebar from '../../components/Sidebar';
import '../companies/CompaniesPage.css';
import '../../components/modals.css';

const PAGE_SIZE = 10;

export default function FoldersPage({
  lang, user, companies, products, folderRows, fileRows,
  onLogout, onNavigate, onToggleLang, onOpenFolder, onCreateFolder,
  onDeleteFolder, onEditFolder, onDuplicateFolder, onAddFile,
  initialCompany, initialProduct,
}) {
  const t = translations[lang];
  const [filterCompany, setFilterCompany] = useState(initialCompany || null);
  const [filterProduct, setFilterProduct] = useState(initialProduct || null);

  useEffect(() => {
    if (initialCompany) setFilterCompany(initialCompany);
    if (initialProduct) setFilterProduct(initialProduct);
  }, [initialCompany, initialProduct]);


  // Table
  const [search,      setSearch]      = useState('');
  const [checked,     setChecked]     = useState(new Set());
  const [sort,        setSort]        = useState({ col: 'id', dir: 'asc' });
  const [page,        setPage]        = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [viewModal,   setViewModal]   = useState(null);
  const [editModal,   setEditModal]   = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [linkCopied,  setLinkCopied]  = useState(false);
  const headerCheckRef = useRef(null);


  const filtered = (folderRows || []).filter(f => {
    if (filterCompany) {
      const enMatch = f.companyEn && filterCompany.en && f.companyEn.toLowerCase() === filterCompany.en.toLowerCase();
      if (!enMatch) return false;
    }
    if (filterProduct) {
      const enMatch = f.productEn && filterProduct.en && f.productEn.toLowerCase() === filterProduct.en.toLowerCase();
      if (!enMatch) return false;
    }
    return !search || (f.en || '').toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.col === 'id')      return (a.id || '').localeCompare(b.id || '') * dir;
    if (sort.col === 'company') return (a.companyEn || '').localeCompare(b.companyEn || '') * dir;
    if (sort.col === 'product') return (a.productEn || '').localeCompare(b.productEn || '') * dir;
    const na = (lang === 'en' ? a.en : a.jp) || '';
    const nb = (lang === 'en' ? b.en : b.jp) || '';
    return na.localeCompare(nb, undefined, { sensitivity: 'base' }) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allChecked  = paginated.length > 0 && paginated.every(f => checked.has(f.id));
  const someChecked = paginated.some(f => checked.has(f.id)) && !allChecked;

  useEffect(() => { if (headerCheckRef.current) headerCheckRef.current.indeterminate = someChecked; }, [someChecked]);
  useEffect(() => { setPage(1); }, [search]);

  function toggleSort(col) { setSort(p => ({ col, dir: p.col === col && p.dir === 'asc' ? 'desc' : 'asc' })); }
  function toggleAll()  { allChecked ? setChecked(new Set()) : setChecked(new Set(paginated.map(f => f.id))); }
  function toggleCheck(id) { setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  return (
    <div className="cp-layout">
      {/* ── Sidebar ── */}
      <Sidebar
        activePage="folders"
        lang={lang}
        user={user}
        companies={companies}
        products={products}
        folderRows={folderRows}
        fileRows={fileRows}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onToggleLang={onToggleLang}
        onOpenFolder={onOpenFolder}
        onOpenFile={onOpenFolder}
        onCreateFolder={onCreateFolder}
      />

      <main className="cp-main">
        <div className="cp-main-header">
          <div className="cp-header-left">
            <h1 className="cp-main-title">{t.folders}</h1>
            <button className="cp-add-btn" onClick={() => onAddFile?.()} title="Add Files">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            {filterCompany && (
              <span className="cp-filter-chip">
                <CompanyIcon size={11} />
                {lang === 'en' ? filterCompany.en : (filterCompany.jp || filterCompany.en)}
                {filterProduct && (<>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  <ProductIcon size={11} />
                  {lang === 'en' ? filterProduct.en : (filterProduct.jp || filterProduct.en)}
                </>)}
                <button className="cp-filter-chip-x" onClick={() => { setFilterCompany(null); setFilterProduct(null); }}>×</button>
              </span>
            )}
          </div>
          <div className="cp-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="cp-search-input" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="cp-table-wrap">
          <div className="cp-table-card">
            <div className="cp-thead">
              <div className="cp-th cp-th-check"><input type="checkbox" className="cp-checkbox" ref={headerCheckRef} checked={allChecked} onChange={toggleAll} /></div>
              <div className="cp-th cp-th-refid" onClick={() => toggleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>Ref ID <span className="cp-sort-arrows">↕</span></div>
              <div className="cp-th cp-th-name" onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>{t.folders || 'Folder'} <span className="cp-sort-arrows">↕</span></div>
              <div className="cp-th cp-th-name" onClick={() => toggleSort('company')} style={{ cursor: 'pointer', userSelect: 'none' }}>{t.company || 'Company'} <span className="cp-sort-arrows">↕</span></div>
              <div className="cp-th cp-th-name" onClick={() => toggleSort('product')} style={{ cursor: 'pointer', userSelect: 'none' }}>{t.product || 'Product'} <span className="cp-sort-arrows">↕</span></div>
              <div className="cp-th cp-th-actions" />
            </div>
            <div className="cp-tbody">
              {paginated.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#9098a9', fontSize: 13 }}>No folders found</div>}
              {paginated.map(f => (
                <div key={f.id} className={`cp-row${checked.has(f.id) ? ' cp-row--checked' : ''}`}>
                  <div className="cp-cell cp-cell-check"><input type="checkbox" className="cp-checkbox" checked={checked.has(f.id)} onChange={() => toggleCheck(f.id)} onClick={e => e.stopPropagation()} /></div>
                  <div className="cp-cell cp-cell-refid">
                    <span className="cp-refid-text">{f.id}</span>
                    <button className="cp-icon-btn" title="Copy ID" onClick={() => navigator.clipboard.writeText(f.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                  <div className="cp-cell cp-cell-name">
                    <span className="cp-product-name" style={{ cursor: 'pointer' }} onClick={() => onOpenFolder?.(f)}>{lang === 'en' ? f.en : (f.jp || f.en)}</span>
                  </div>
                  <div className="cp-cell cp-cell-name" style={{ color: '#6b7280', fontSize: 13 }}>{f.companyEn || '-'}</div>
                  <div className="cp-cell cp-cell-name" style={{ color: '#6b7280', fontSize: 13 }}>{f.productEn || '-'}</div>
                  <div className="cp-cell cp-cell-actions">
                    <button className="cp-icon-btn" title="Copy link" onClick={() => { navigator.clipboard.writeText(f.id); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                    <button className="cp-icon-btn" title="Duplicate" onClick={() => onDuplicateFolder?.(f)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button className="cp-icon-btn cp-icon-btn--view" title="View" onClick={() => setViewModal(f)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button className="cp-icon-btn cp-icon-btn--edit" title="Edit" onClick={() => { setEditModal(f); setEditForm({ ...f }); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button className="cp-icon-btn cp-icon-btn--delete" title="Delete" onClick={() => setDeleteModal(f)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cp-pagination">
              <span className="cp-pagination-info">Showing {sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
              <div className="cp-pagination-btns">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`cp-page-btn${p === page ? ' cp-page-btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                {page < totalPages && <button className="cp-page-btn" onClick={() => setPage(p => p + 1)}>→</button>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {deleteModal && (
        <div className="del-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="del-modal" onClick={e => e.stopPropagation()}>
            <div className="del-modal-header">
              <div className="del-modal-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
              <div className="del-modal-titles"><div className="del-modal-title">Delete</div><div className="del-modal-subtitle">This action cannot be undone</div></div>
              <button className="del-modal-close" onClick={() => setDeleteModal(null)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="del-modal-body">
              <p className="del-modal-text">Delete "<strong>{lang === 'en' ? deleteModal.en : (deleteModal.jp || deleteModal.en)}</strong>"?</p>
              <p className="del-modal-warning">This will permanently remove the folder.</p>
            </div>
            <div className="del-modal-footer">
              <button className="del-modal-cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="del-modal-confirm" onClick={() => { onDeleteFolder?.(deleteModal.id); setDeleteModal(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {viewModal && (
        <div className="vd-backdrop" onClick={() => setViewModal(null)}>
          <div className="vd-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-modal-header">
              <span className="vd-modal-title">View Details</span>
              <button className="vd-modal-close" onClick={() => setViewModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="vd-modal-body">
              <div className="vd-field">
                <label className="vd-label">Folder</label>
                <div className="vd-value">{(lang === 'en' ? viewModal.en : (viewModal.jp || viewModal.en)) || '-'}</div>
              </div>
              <div className="vd-field">
                <label className="vd-label">File Name</label>
                <div className="vd-value">{viewModal.fileName || '-'}</div>
              </div>
              <div className="vd-field">
                <label className="vd-label">Preview</label>
                <div className="vd-preview">
                  {viewModal.thumbnailUrl
                    ? <img src={viewModal.thumbnailUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 6, objectFit: 'contain' }} />
                    : <span className="vd-preview-empty">No preview available</span>
                  }
                </div>
              </div>
            </div>
            <div className="vd-modal-footer">
              <button className="vd-close-btn" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="ed-backdrop" onClick={() => setEditModal(null)}>
          <div className="ed-modal" onClick={e => e.stopPropagation()}>
            <div className="ed-modal-header">
              <span className="ed-modal-title">Edit Details</span>
              <button className="ed-modal-close" onClick={() => setEditModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="ed-modal-body">
              <div className="ed-field">
                <label className="ed-label">Ref ID</label>
                <input className="ed-input" value={editForm.id || ''} onChange={e => setEditForm(p => ({ ...p, id: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Folder</label>
                <input className="ed-input" value={editForm.en || ''} onChange={e => setEditForm(p => ({ ...p, en: e.target.value, jp: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Company</label>
                <input className="ed-input" value={editForm.companyEn || ''} onChange={e => setEditForm(p => ({ ...p, companyEn: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Product</label>
                <input className="ed-input" value={editForm.productEn || ''} onChange={e => setEditForm(p => ({ ...p, productEn: e.target.value }))} />
              </div>
              <div className="ed-modal-footer">
                <button className="ed-cancel" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="ed-save" onClick={() => { onEditFolder?.({ ...editModal, ...editForm }); setEditModal(null); }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {linkCopied && (
        <div className="cp-link-toast"><div className="cp-link-toast-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>Link copied</div>
      )}

    </div>
  );
}
