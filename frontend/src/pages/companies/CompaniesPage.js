import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';
import { getFormFields } from '../../data';

const PAGE_SIZE = 10;

export default function CompaniesPage({
  lang, user, companies, folderRows, products,
  onLogout, onNavigate, onToggleLang,
  onAddCompany, onEditCompany, onDeleteCompany, onDuplicateCompany, onCreateFolder,
}) {
  const t = translations[lang];
  // Sidebar
  const [collapsed,         setCollapsed]         = useState(false);
  const [productsOpen,      setProductsOpen]      = useState(false);
  const [foldersOpen,       setFoldersOpen]       = useState(false);
  const [langOpen,          setLangOpen]          = useState(false);
  const [recentFoldersOpen, setRecentFoldersOpen] = useState(false);
  const [recentFilesOpen,   setRecentFilesOpen]   = useState(false);
  const [showNewFolder,     setShowNewFolder]     = useState(false);
  const [newFolderName,     setNewFolderName]     = useState('');
  const [newFolderProduct,  setNewFolderProduct]  = useState('');
  const [productSearch,     setProductSearch]     = useState('');
  const [folderSearch,      setFolderSearch]      = useState('');
  // Custom folder product dropdown
  const [nfDropOpen,    setNfDropOpen]    = useState(false);
  const [nfDropStep,    setNfDropStep]    = useState('company'); // 'company' | 'product'
  const [nfDropCompany, setNfDropCompany] = useState(null);
  const [nfCoSearch,    setNfCoSearch]    = useState('');
  const nfDropRef = useRef(null);

  // Table
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState({ col: 'id', dir: 'asc' });
  const [checked,  setChecked]  = useState(new Set());
  const [page,     setPage]     = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal,   setEditModal]   = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [viewModal,   setViewModal]   = useState(null);
  const [linkCopied,  setLinkCopied]  = useState(false);
  const headerCheckRef = useRef(null);

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  // Close new folder dropdown when clicking outside
  useEffect(() => {
    if (!nfDropOpen) return;
    function outside(e) { if (nfDropRef.current && !nfDropRef.current.contains(e.target)) setNfDropOpen(false); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [nfDropOpen]);

  function resetNewFolder() {
    setShowNewFolder(false); setNewFolderName(''); setNewFolderProduct('');
    setNfDropOpen(false); setNfDropStep('company'); setNfDropCompany(null); setNfCoSearch('');
  }

  // Derived values for the custom dropdown
  const nfSelectedProduct = (products || []).find(p => (p._awid || p.id) === newFolderProduct);
  const nfTriggerLabel = nfSelectedProduct
    ? `${lang === 'en' ? (nfSelectedProduct.companyEn || '') : (nfSelectedProduct.companyJp || nfSelectedProduct.companyEn || '')} › ${lang === 'en' ? nfSelectedProduct.en : (nfSelectedProduct.jp || nfSelectedProduct.en)}`
    : (t.selectProduct || 'Select a product...');
  const nfFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !nfCoSearch || name.toLowerCase().includes(nfCoSearch.toLowerCase());
  });
  const nfCompanyProducts = nfDropCompany
    ? (products || []).filter(p => p.companyEn === nfDropCompany.en || p.companyJp === nfDropCompany.jp)
    : [];

  // Table logic
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
      <aside className={`cp-sidebar${collapsed ? ' cp-sidebar--collapsed' : ''}`}>

        <div className="cp-sidebar-header">
          {!collapsed && <span className="cp-sidebar-brand">ChatCND</span>}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setCollapsed(c => !c)}>
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </div>

        {!collapsed && <div className="cp-section-label">{t.menu}</div>}

        <nav className="cp-nav">
          <button className="cp-nav-item" title={t.newChat} onClick={() => onNavigate('newChat')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!collapsed && t.newChat}
          </button>

          <button className="cp-nav-item" title={t.newFolder} onClick={() => setShowNewFolder(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {!collapsed && t.newFolder}
          </button>

          <button className="cp-nav-item" title={t.notification} onClick={() => onNavigate('notification')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!collapsed && t.notification}
          </button>

          <button className="cp-nav-item cp-nav-item--active" title={t.companies}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {!collapsed && t.companies}
          </button>

          <button className="cp-nav-item cp-nav-item--expand" title={t.products} onClick={() => !collapsed && setProductsOpen(o => !o)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              {!collapsed && t.products}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>

          {!collapsed && productsOpen && (
            <div className="cp-sub-panel">
              <div className="cp-sub-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="cp-sub-search" placeholder={t.searchProduct} value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              <div className="cp-sub-label">{t.product2}</div>
              <div className="cp-sub-list">
                {(products || [])
                  .filter(p => {
                    const name = lang === 'en' ? p.en : (p.jp || p.en);
                    return !productSearch || name.toLowerCase().includes(productSearch.toLowerCase());
                  })
                  .map((p, i) => (
                    <button key={i} className="cp-sub-item" onClick={() => onNavigate('products')}>
                      <div className="cp-sub-item-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </div>
                      <span className="cp-sub-item-name">{lang === 'en' ? p.en : (p.jp || p.en)}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                {(products || []).filter(p => {
                  const name = lang === 'en' ? p.en : (p.jp || p.en);
                  return !productSearch || name.toLowerCase().includes(productSearch.toLowerCase());
                }).length === 0 && (
                  <div className="cp-sub-empty">{t.noProducts}</div>
                )}
              </div>
            </div>
          )}

          <button className="cp-nav-item cp-nav-item--expand" title={t.folders} onClick={() => !collapsed && setFoldersOpen(o => !o)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {!collapsed && t.folders}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: foldersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>

          {!collapsed && foldersOpen && (
            <div className="cp-sub-panel">
              <div className="cp-sub-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="cp-sub-search" placeholder={t.searchFolder} value={folderSearch} onChange={e => setFolderSearch(e.target.value)} />
              </div>
              <div className="cp-sub-label">{t.folder2}</div>
              <div className="cp-sub-list">
                {(folderRows || [])
                  .filter(f => {
                    const name = lang === 'en' ? f.en : (f.jp || f.en);
                    return !folderSearch || name.toLowerCase().includes(folderSearch.toLowerCase());
                  })
                  .map((f, i) => (
                    <button key={i} className="cp-sub-item" onClick={() => onNavigate('folders')}>
                      <div className="cp-sub-item-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <span className="cp-sub-item-name">{lang === 'en' ? f.en : (f.jp || f.en)}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                {(folderRows || []).filter(f => {
                  const name = lang === 'en' ? f.en : (f.jp || f.en);
                  return !folderSearch || name.toLowerCase().includes(folderSearch.toLowerCase());
                }).length === 0 && (
                  <div className="cp-sub-empty">{t.noFolders}</div>
                )}
              </div>
            </div>
          )}
        </nav>

        {!collapsed && <>
          <button className="cp-section-label cp-section-label--btn" style={{ marginTop: 12 }} onClick={() => setRecentFoldersOpen(o => !o)}>
            {t.recentFolders}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginLeft: 'auto', transform: recentFoldersOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          {recentFoldersOpen && (
            <div className="cp-folder-list">
              {(folderRows || []).slice(0, 10).length === 0 && <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>{t.noFoldersYet}</div>}
              {(folderRows || []).slice(0, 10).map((f, i) => (
                <button key={i} className="cp-folder-item" onClick={() => onNavigate('folders')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  {lang === 'en' ? f.en : f.jp}
                </button>
              ))}
            </div>
          )}

          <button className="cp-section-label cp-section-label--btn" onClick={() => setRecentFilesOpen(o => !o)}>
            {t.recentFiles}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginLeft: 'auto', transform: recentFilesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </>}

        {/* Footer */}
        <div className="cp-sidebar-footer">
          {collapsed ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <div className="cp-user-avatar">{displayName[0]?.toUpperCase()}</div>
            </>
          ) : (
            <>
              <div className="cp-user-row">
                <div className="cp-user-avatar">{displayName[0]?.toUpperCase()}</div>
                <div className="cp-user-info">
                  <div className="cp-user-name">{displayName}</div>
                  <div className="cp-user-email">{displayEmail}</div>
                </div>
                <button className="cp-logout-btn" onClick={onLogout} title="Logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
              <div className="cp-lang-row" style={{ position: 'relative' }}>
                {langOpen && (
                  <div className="cp-lang-dropdown">
                    <button className={`cp-lang-option${lang === 'en' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'en') onToggleLang?.(); setLangOpen(false); }}>
                      <span className="cp-lang-badge">EN</span>{t.english}
                      {lang === 'en' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <button className={`cp-lang-option${lang === 'jp' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'jp') onToggleLang?.(); setLangOpen(false); }}>
                      <span className="cp-lang-badge">JP</span>{t.japanese}
                      {lang === 'jp' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  </div>
                )}
                <button className="cp-lang-btn" onClick={() => setLangOpen(o => !o)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>{lang === 'en' ? t.english : t.japanese}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <div className="cp-version">v1.0.0</div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="cp-main">

        {/* Header */}
        <div className="cp-main-header">
          <div className="cp-header-left">
            <h1 className="cp-main-title">{t.companies}</h1>
            <button className="cp-add-btn" onClick={onAddCompany} title="Add company">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          <div className="cp-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="cp-search-input" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="cp-table-wrap">
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
                  <span className="cp-company-name" onClick={() => setViewModal(c)}>
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
        </div>
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
              </div>
              <div className="ed-modal-footer">
                <button className="ed-cancel" onClick={() => setEditModal(null)}>{t.cancel}</button>
                <button className="ed-save" onClick={() => { onEditCompany && onEditCompany({ ...editModal, ...editForm }); setEditModal(null); }}>{t.save}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Link copied toast */}
      {linkCopied && (
        <div className="cp-link-toast">
          <div className="cp-link-toast-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {t.linkCopied || 'Link copied'}
        </div>
      )}

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

      {/* New Folder modal */}
      {showNewFolder && (
        <div className="np-modal-backdrop" onClick={resetNewFolder}>
          <div className="np-modal" onClick={e => e.stopPropagation()}>
            <div className="np-modal-header">
              <span className="np-modal-title">{t.newFolder}</span>
              <button className="np-modal-close" onClick={resetNewFolder}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="np-modal-body">
              <div className="np-modal-field">
                <label className="np-modal-label">{t.product}</label>
                {/* Custom two-step dropdown */}
                <div className="nf-drop" ref={nfDropRef}>
                  <button
                    type="button"
                    className={`nf-drop-trigger${nfDropOpen ? ' nf-drop-trigger--open' : ''}${newFolderProduct ? ' nf-drop-trigger--selected' : ''}`}
                    onClick={() => { setNfDropOpen(o => !o); setNfDropStep('company'); setNfCoSearch(''); }}
                  >
                    <span className={newFolderProduct ? 'nf-drop-value' : 'nf-drop-placeholder'}>{nfTriggerLabel}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: nfDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>

                  {nfDropOpen && (
                    <div className="nf-drop-panel">
                      {nfDropStep === 'company' && (<>
                        <div className="nf-drop-search-wrap">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <input
                            className="nf-drop-search"
                            placeholder={t.searchCompany || 'Search company...'}
                            value={nfCoSearch}
                            onChange={e => setNfCoSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="nf-drop-list">
                          {nfFilteredCompanies.map(c => (
                            <button key={c.id} type="button" className="nf-drop-item"
                              onClick={() => { setNfDropCompany(c); setNfDropStep('product'); }}>
                              <div className="nf-drop-item-icon">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                              </div>
                              <span className="nf-drop-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                          ))}
                          {nfFilteredCompanies.length === 0 && <div className="nf-drop-empty">{t.noCompanies || 'No companies found'}</div>}
                        </div>
                      </>)}

                      {nfDropStep === 'product' && (<>
                        <button type="button" className="nf-drop-back" onClick={() => { setNfDropStep('company'); setNfCoSearch(''); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                          <span>{lang === 'en' ? nfDropCompany?.en : (nfDropCompany?.jp || nfDropCompany?.en)}</span>
                        </button>
                        <div className="nf-drop-list">
                          {nfCompanyProducts.map((p, i) => (
                            <button key={i} type="button" className="nf-drop-item"
                              onClick={() => { setNewFolderProduct(p._awid || p.id); setNfDropOpen(false); }}>
                              <div className="nf-drop-item-icon">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                              </div>
                              <span className="nf-drop-item-name">{lang === 'en' ? p.en : (p.jp || p.en)}</span>
                            </button>
                          ))}
                          {nfCompanyProducts.length === 0 && <div className="nf-drop-empty">{t.noProducts || 'No products'}</div>}
                        </div>
                      </>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="np-modal-field">
                <label className="np-modal-label">{t.folderName}</label>
                <input className="np-modal-input" placeholder="e.g. Spring Campaign 2026" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
              </div>
            </div>
            <div className="np-modal-footer">
              <button className="np-modal-cancel" onClick={resetNewFolder}>{t.cancel}</button>
              <button className="np-modal-create" onClick={() => {
                if (newFolderName.trim()) {
                  onCreateFolder && onCreateFolder({ name: newFolderName.trim(), productId: newFolderProduct });
                }
                resetNewFolder();
              }}>{t.createFolder}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
