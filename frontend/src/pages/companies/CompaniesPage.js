import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';
import { getFormFields } from '../../data';
import Sidebar from '../../components/Sidebar';
import './CompaniesPage.css';
import '../../components/modals.css';

const PAGE_SIZE = 10;

export default function CompaniesPage({
  lang, user, companies, folderRows, products,
  onLogout, onNavigate, onToggleLang,
  onAddCompany, onAddProduct, onEditCompany, onDeleteCompany, onDuplicateCompany, onCreateFolder,
  onEditProduct, onDeleteProduct, onDuplicateProduct,
  initialCompany,
}) {
  const t = translations[lang];

  // Products view mode
  const [viewMode,       setViewMode]       = useState(initialCompany ? 'products' : 'companies');
  const [filterCompany,  setFilterCompany]  = useState(initialCompany || null);

  useEffect(() => {
    if (initialCompany) { setViewMode('products'); setFilterCompany(initialCompany); }
  }, [initialCompany]);


  // Table
  const [search,   setSearch]   = useState('');
  const [pChecked, setPChecked] = useState(new Set());
  const [sort,     setSort]     = useState({ col: 'id', dir: 'asc' });
  const [checked,  setChecked]  = useState(new Set());
  const [page,     setPage]     = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal,   setEditModal]   = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [viewModal,   setViewModal]   = useState(null);
  const [linkCopied,  setLinkCopied]  = useState(false);
  const [pDeleteModal, setPDeleteModal] = useState(null);
  const [pViewModal,   setPViewModal]   = useState(null);
  const [pEditModal,   setPEditModal]   = useState(null);
  const [pEditForm,    setPEditForm]    = useState({});
  const [pLinkCopied,  setPLinkCopied]  = useState(false);
  const headerCheckRef = useRef(null);

  // Products table derived
  const filteredProducts = (products || [])
    .filter(p => {
      if (!filterCompany) return true;
      const enMatch = p.companyEn && filterCompany.en && p.companyEn.toLowerCase() === filterCompany.en.toLowerCase();
      const idMatch = p.companyId && (p.companyId === filterCompany._awid || p.companyId === filterCompany.id);
      return enMatch || idMatch;
    })
    .filter(p => !search || (p.en || '').toLowerCase().includes(search.toLowerCase()) || (p.companyEn || '').toLowerCase().includes(search.toLowerCase()));
  const pAllChecked = filteredProducts.length > 0 && filteredProducts.every(p => pChecked.has(p.id));
  function togglePCheck(id) { setPChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }); }
  function togglePAll() { setPChecked(pAllChecked ? new Set() : new Set(filteredProducts.map(p => p.id))); }

  // Companies table logic
  const filtered = (companies || []).filter(c =>
    (c.en || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.jp || '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.col === 'id') return (a.id || '').localeCompare(b.id || '') * dir;
    const na = (lang === 'en' ? a.en : a.jp) || '';
    const nb = (lang === 'en' ? b.en : b.jp) || '';
    return na.localeCompare(nb, undefined, { sensitivity: 'base' }) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allChecked  = paginated.length > 0 && paginated.every(c => checked.has(c.id));
  const someChecked = paginated.some(c => checked.has(c.id)) && !allChecked;

  useEffect(() => { if (headerCheckRef.current) headerCheckRef.current.indeterminate = someChecked; }, [someChecked]);
  useEffect(() => { setPage(1); }, [search]);

  function toggleSort(col) { setSort(p => ({ col, dir: p.col === col && p.dir === 'asc' ? 'desc' : 'asc' })); }
  function toggleAll() { allChecked ? setChecked(new Set()) : setChecked(new Set(paginated.map(c => c.id))); }
  function toggleCheck(id) { setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  function SortArrow({ col }) {
    const upColor   = sort.col === col && sort.dir === 'asc'  ? '#6366f1' : '#b0b8c8';
    const downColor = sort.col === col && sort.dir === 'desc' ? '#6366f1' : '#b0b8c8';
    return (
      <svg width="12" height="18" viewBox="0 0 12 18" fill="none" style={{ marginLeft: 4, flexShrink: 0 }}>
        {/* Up arrow */}
        <polyline points="2.5,7 6,2.5 9.5,7" stroke={upColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6" y1="3" x2="6" y2="8.5" stroke={upColor} strokeWidth="1.6" strokeLinecap="round"/>
        {/* Down arrow */}
        <polyline points="2.5,11 6,15.5 9.5,11" stroke={downColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6" y1="9.5" x2="6" y2="15" stroke={downColor} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <div className="cp-layout">

      {/* ── Sidebar ── */}
      <Sidebar
        activePage="companies"
        lang={lang}
        user={user}
        companies={companies}
        products={products}
        folderRows={folderRows}
        fileRows={[]}
        onNavigate={(section, data) => {
          if (section === 'companies' && data) { setFilterCompany(data); setViewMode('products'); }
          else onNavigate(section, data);
        }}
        onLogout={onLogout}
        onToggleLang={onToggleLang}
        onOpenFolder={() => onNavigate('folders')}
        onCreateFolder={onCreateFolder}
      />

      {/* ── Main ── */}
      <main className="cp-main">

        {/* Header */}
        <div className="cp-main-header">
          <div className="cp-header-left">
            <h1 className="cp-main-title">{viewMode === 'products' ? (t.products || 'Products') : t.companies}</h1>
            <button className="cp-add-btn" onClick={() => viewMode === 'products' ? onAddProduct?.(filterCompany) : onAddCompany?.()} title="Add">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            {viewMode === 'products' && filterCompany && (
              <span className="cp-filter-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>
                </svg>
                {lang === 'en' ? filterCompany.en : (filterCompany.jp || filterCompany.en)}
                <button className="cp-filter-chip-x" onClick={() => { setFilterCompany(null); setViewMode('companies'); }}>×</button>
              </span>
            )}
          </div>
          <div className="cp-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="cp-search-input" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Products table */}
        {viewMode === 'products' && (
          <div className="cp-table-wrap">
            <div className="cp-table-card">
              {pChecked.size > 0 && (
                <div className="cp-selection-bar">
                  <span className="cp-selection-count">{pChecked.size} selected</span>
                  <div className="cp-selection-actions">
                    <button className="cp-clear-sel-btn" onClick={() => setPChecked(new Set())}>Clear Selection</button>
                    <button className="cp-delete-sel-btn" onClick={() => {
                      [...pChecked].forEach(id => onDeleteProduct?.(id));
                      setPChecked(new Set());
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
              <div className="cp-thead">
                <div className="cp-th cp-th-check">
                  <input type="checkbox" className="cp-checkbox" checked={pAllChecked} onChange={togglePAll} />
                </div>
                <div className="cp-th cp-th-refid">Ref ID <span className="cp-sort-arrows">↕</span></div>
                <div className="cp-th cp-th-name">{t.product || 'Product'} <span className="cp-sort-arrows">↕</span></div>
                <div className="cp-th cp-th-name">{t.company || 'Company'} <span className="cp-sort-arrows">↕</span></div>
                <div className="cp-th cp-th-actions" />
              </div>
              <div className="cp-tbody">
                {filteredProducts.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#9098a9', fontSize: 13 }}>No products found</div>
                )}
                {filteredProducts.map(p => (
                  <div key={p.id} className={`cp-row${pChecked.has(p.id) ? ' cp-row--checked' : ''}`}>
                    <div className="cp-cell cp-cell-check">
                      <input type="checkbox" className="cp-checkbox" checked={pChecked.has(p.id)} onChange={() => togglePCheck(p.id)} onClick={e => e.stopPropagation()} />
                    </div>
                    <div className="cp-cell cp-cell-refid">
                      <span className="cp-refid-text">{p.id}</span>
                      <button className="cp-icon-btn" title="Copy ID" onClick={() => navigator.clipboard.writeText(p.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                    <div className="cp-cell cp-cell-name">
                      <span className="cp-product-name">{lang === 'en' ? p.en : (p.jp || p.en)}</span>
                    </div>
                    <div className="cp-cell cp-cell-name" style={{ color: '#6b7280', fontSize: 13 }}>
                      {lang === 'en' ? p.companyEn : (p.companyJp || p.companyEn)}
                    </div>
                    <div className="cp-cell cp-cell-actions">
                      <button className="cp-icon-btn" title="Copy link" onClick={() => { navigator.clipboard.writeText(p.id); setPLinkCopied(true); setTimeout(() => setPLinkCopied(false), 2500); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </button>
                      <button className="cp-icon-btn" title="Duplicate" onClick={() => onDuplicateProduct?.(p)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button className="cp-icon-btn cp-icon-btn--view" title="View" onClick={() => setPViewModal(p)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="cp-icon-btn cp-icon-btn--edit" title="Edit" onClick={() => { setPEditModal(p); setPEditForm({ ...p }); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button className="cp-icon-btn cp-icon-btn--delete" title="Delete" onClick={() => setPDeleteModal(p)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cp-pagination">
                <span className="cp-pagination-info">Showing 1–{filteredProducts.length} of {filteredProducts.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Companies table */}
        {viewMode === 'companies' && <div className="cp-table-wrap">
          <div className="cp-table-card">
          {/* Head */}
          <div className="cp-thead">
            <div className="cp-th cp-th-check">
              <input type="checkbox" className="cp-checkbox" ref={headerCheckRef} checked={allChecked} onChange={toggleAll} />
            </div>
            <div className="cp-th cp-th-refid" onClick={() => toggleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              {t.refIdCol} <SortArrow col="id" />
            </div>
            <div className="cp-th cp-th-name" onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              {t.companyCol} <SortArrow col="name" />
            </div>
            <div className="cp-th cp-th-actions" />
          </div>

          {/* Body */}
          <div className="cp-tbody">
            {paginated.map(c => (
              <div key={c.id} className={`cp-row${checked.has(c.id) ? ' cp-row--checked' : ''}`}>
                <div className="cp-cell cp-cell-check">
                  <input type="checkbox" className="cp-checkbox" checked={checked.has(c.id)} onChange={() => toggleCheck(c.id)} onClick={e => e.stopPropagation()} />
                </div>
                <div className="cp-cell cp-cell-refid">
                  <span className="cp-refid-text">{c.id}</span>
                  <button className="cp-icon-btn" title="Copy ID" onClick={() => navigator.clipboard.writeText(c.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
                <div className="cp-cell cp-cell-name">
                  <span className="cp-company-name" onClick={() => { setFilterCompany(c); setViewMode('products'); }}>
                    {lang === 'en' ? c.en : (c.jp || c.en)}
                  </span>
                </div>
                <div className="cp-cell cp-cell-actions">
                  <button className="cp-icon-btn" title="Copy link" onClick={() => { navigator.clipboard.writeText(c.id); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </button>
                  <button className="cp-icon-btn" title="Duplicate" onClick={() => onDuplicateCompany && onDuplicateCompany(c)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button className="cp-icon-btn cp-icon-btn--view" title="View" onClick={() => setViewModal(c)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button className="cp-icon-btn cp-icon-btn--edit" title="Edit" onClick={() => { setEditModal(c); setEditForm({ ...c }); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  </button>
                  <button className="cp-icon-btn cp-icon-btn--delete" title="Delete" onClick={() => setDeleteModal(c)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="cp-pagination">
            <span className="cp-pagination-info">{t.showing} {sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} {t.of} {sorted.length}</span>
            <div className="cp-pagination-btns">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`cp-page-btn${p === page ? ' cp-page-btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              {page < totalPages && <button className="cp-page-btn" onClick={() => setPage(p => p + 1)}>→</button>}
            </div>
          </div>
          </div>
        </div>}

      </main>

      {/* Delete modal */}
      {deleteModal && (
        <div className="del-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="del-modal" onClick={e => e.stopPropagation()}>
            <div className="del-modal-header">
              <div className="del-modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="del-modal-titles">
                <div className="del-modal-title">{t.delete}</div>
                <div className="del-modal-subtitle">{t.deleteConfirmation}</div>
              </div>
              <button className="del-modal-close" onClick={() => setDeleteModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="del-modal-body">
              <p className="del-modal-text">{t.deleteMessage} "<strong>{lang === 'en' ? deleteModal.en : deleteModal.jp}</strong>"?</p>
              <p className="del-modal-warning">{t.deleteWarning}</p>
            </div>
            <div className="del-modal-footer">
              <button className="del-modal-cancel" onClick={() => setDeleteModal(null)}>{t.cancel}</button>
              <button className="del-modal-confirm" onClick={() => { onDeleteCompany && onDeleteCompany(deleteModal.id); setDeleteModal(null); }}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details modal */}
      {editModal && (() => {
        const formFields = getFormFields(t);
        const textareaKeys = ['brandConcept','companyCategories','headquartersLocation','foundingDate',
          'businessActivities','mainProducts','salesScale','marketShare','targetCustomer',
          'competitors','missionVision','brandStrategy','promotionHistory','swot',
          'valueProposition','futureStrategy','notes'];
        return (
          <div className="ed-backdrop" onClick={() => setEditModal(null)}>
            <div className="ed-modal" onClick={e => e.stopPropagation()}>
              <div className="ed-modal-header">
                <span className="ed-modal-title">{t.editBtn} {t.companyDetails}</span>
                <button className="ed-modal-close" onClick={() => setEditModal(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="ed-modal-body">
                {formFields.map(f => (
                  <div className="ed-field" key={f.key}>
                    <label className="ed-label">{f.label}{f.required && <span className="ed-required"> *</span>}</label>
                    {textareaKeys.includes(f.key) ? (
                      <textarea className="ed-textarea" value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    ) : (
                      <input className="ed-input" type={f.type || 'text'} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    )}
                  </div>
                ))}
                <div className="ed-modal-footer">
                  <button className="ed-cancel" onClick={() => setEditModal(null)}>{t.cancel}</button>
                  <button className="ed-save" onClick={() => { onEditCompany && onEditCompany({ ...editModal, ...editForm }); setEditModal(null); }}>{t.save}</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Link copied toast */}
      {(linkCopied || pLinkCopied) && (
        <div className="cp-link-toast">
          <div className="cp-link-toast-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {t.linkCopied || 'Link copied'}
        </div>
      )}

      {/* Product Delete modal */}
      {pDeleteModal && (
        <div className="del-backdrop" onClick={() => setPDeleteModal(null)}>
          <div className="del-modal" onClick={e => e.stopPropagation()}>
            <div className="del-modal-header">
              <div className="del-modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="del-modal-titles">
                <div className="del-modal-title">{t.delete || 'Delete'}</div>
                <div className="del-modal-subtitle">{t.deleteConfirmation || 'This action cannot be undone'}</div>
              </div>
              <button className="del-modal-close" onClick={() => setPDeleteModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="del-modal-body">
              <p className="del-modal-text">{t.deleteMessage || 'Delete'} "<strong>{lang === 'en' ? pDeleteModal.en : (pDeleteModal.jp || pDeleteModal.en)}</strong>"?</p>
              <p className="del-modal-warning">{t.deleteWarning || 'This will permanently remove the product.'}</p>
            </div>
            <div className="del-modal-footer">
              <button className="del-modal-cancel" onClick={() => setPDeleteModal(null)}>{t.cancel || 'Cancel'}</button>
              <button className="del-modal-confirm" onClick={() => { onDeleteProduct?.(pDeleteModal.id); setPDeleteModal(null); }}>{t.delete || 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Product View modal */}
      {pViewModal && (() => {
        const preview = pViewModal.brandConcept || pViewModal.productSpecifications || pViewModal.notes || pViewModal.differentiationPoints || '';
        return (
          <div className="vd-backdrop" onClick={() => setPViewModal(null)}>
            <div className="vd-modal" onClick={e => e.stopPropagation()}>
              <div className="vd-modal-header">
                <span className="vd-modal-title">View Details</span>
                <button className="vd-modal-close" onClick={() => setPViewModal(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="vd-modal-body">
                <div className="vd-field">
                  <label className="vd-label">Company</label>
                  <div className={`vd-value${!pViewModal.companyEn ? ' vd-value--empty' : ''}`}>{pViewModal.companyEn || '-'}</div>
                </div>
                <div className="vd-field">
                  <label className="vd-label">Product Name</label>
                  <div className={`vd-value${!pViewModal.en ? ' vd-value--empty' : ''}`}>{(lang === 'en' ? pViewModal.en : (pViewModal.jp || pViewModal.en)) || '-'}</div>
                </div>
                <div className="vd-field">
                  <label className="vd-label">Preview</label>
                  <div className={`vd-preview${!preview ? ' vd-preview--empty' : ''}`}>{preview || 'No preview available'}</div>
                </div>
              </div>
              <div className="vd-modal-footer">
                <button className="vd-close-btn" onClick={() => setPViewModal(null)}>{t.close || 'Close'}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Product Edit modal */}
      {pEditModal && (() => {
        const productFields = [
          { key: 'en', label: 'Product Name (EN)', type: 'text' },
          { key: 'jp', label: 'Product Name (JP)', type: 'text' },
          { key: 'websiteUrl', label: 'Website URL', type: 'text' },
          { key: 'industry', label: 'Industry', type: 'text' },
          { key: 'employees', label: 'Employees', type: 'text' },
          { key: 'revenueScale', label: 'Revenue Scale', type: 'text' },
          { key: 'releaseDate', label: 'Release Date', type: 'text' },
          { key: 'price', label: 'Price', type: 'text' },
          { key: 'targetCustomers', label: 'Target Customers', type: 'textarea' },
          { key: 'differentiationPoints', label: 'Differentiation Points / USP', type: 'textarea' },
          { key: 'productSpecifications', label: 'Product Specifications', type: 'textarea' },
          { key: 'brandConcept', label: 'Brand Concept', type: 'textarea' },
          { key: 'brandStrategy', label: 'Brand Strategy / Tone & Manner', type: 'textarea' },
          { key: 'usageScenes', label: 'Usage Scenes', type: 'textarea' },
          { key: 'customerInsight', label: 'Customer Insight', type: 'textarea' },
          { key: 'priceJustification', label: 'Price Justification', type: 'textarea' },
          { key: 'salesScale', label: 'Sales Scale / Market Share', type: 'textarea' },
          { key: 'costStructure', label: 'Cost Structure', type: 'textarea' },
          { key: 'pastPromotion', label: 'Past Promotion', type: 'textarea' },
          { key: 'salesChannels', label: 'Sales Channels', type: 'textarea' },
          { key: 'swotAnalysis', label: 'SWOT Analysis', type: 'textarea' },
          { key: 'futureOutlook', label: 'Future Outlook / Roadmap', type: 'textarea' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
        return (
          <div className="ed-backdrop" onClick={() => setPEditModal(null)}>
            <div className="ed-modal" onClick={e => e.stopPropagation()}>
              <div className="ed-modal-header">
                <span className="ed-modal-title">Edit Details</span>
                <button className="ed-modal-close" onClick={() => setPEditModal(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="ed-modal-body">
                {productFields.map(f => (
                  <div className="ed-field" key={f.key}>
                    <label className="ed-label">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea className="ed-textarea" value={pEditForm[f.key] || ''} onChange={e => setPEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    ) : (
                      <input className="ed-input" type="text" value={pEditForm[f.key] || ''} onChange={e => setPEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    )}
                  </div>
                ))}
                <div className="ed-modal-footer">
                  <button className="ed-cancel" onClick={() => setPEditModal(null)}>{t.cancel || 'Cancel'}</button>
                  <button className="ed-save" onClick={() => { onEditProduct?.({ ...pEditModal, ...pEditForm }); setPEditModal(null); }}>{t.save || 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Details modal */}
      {viewModal && (
        <div className="vd-backdrop" onClick={() => setViewModal(null)}>
          <div className="vd-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-modal-header">
              <span className="vd-modal-title">{t.viewDetails || 'View Details'}</span>
              <button className="vd-modal-close" onClick={() => setViewModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="vd-modal-body">
              <div className="vd-field">
                <label className="vd-label">{t.refIdCol || 'Reference ID'}</label>
                <div className="vd-value">{viewModal.id || '-'}</div>
              </div>
              <div className="vd-field">
                <label className="vd-label">{t.companyNameEn || 'Company Name (EN)'}</label>
                <div className="vd-value">{viewModal.en || '-'}</div>
              </div>
              <div className="vd-field">
                <label className="vd-label">{t.companyNameJp || 'Company Name (JP)'}</label>
                <div className="vd-value">{viewModal.jp || '-'}</div>
              </div>
            </div>
            <div className="vd-modal-footer">
              <button className="vd-close-btn" onClick={() => setViewModal(null)}>{t.close || 'Close'}</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
