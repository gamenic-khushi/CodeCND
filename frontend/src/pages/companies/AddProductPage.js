import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';
import './CompaniesPage.css';
import '../../components/modals.css';

export default function AddProductPage({
  lang, user, companies, folderRows, fileRows, products,
  initialCompany,
  onLogout, onNavigate, onToggleLang, onSave, onBack,
}) {
  const t = translations[lang] || translations['en'];

  // Sidebar state
  const [collapsed,         setCollapsed]         = useState(false);
  const [langOpen,          setLangOpen]          = useState(false);
  const [productsOpen,      setProductsOpen]      = useState(true);
  const [pdCoSearch,        setPdCoSearch]        = useState('');
  const [foldersOpen,       setFoldersOpen]       = useState(false);
  const [fdCoSearch,        setFdCoSearch]        = useState('');
  const [recentFoldersOpen, setRecentFoldersOpen] = useState(true);
  const [recentFilesOpen,   setRecentFilesOpen]   = useState(true);
  const [folderSearch,      setFolderSearch]      = useState('');
  const [fileSearch,        setFileSearch]        = useState('');

  // New Folder modal state
  const [showNewFolder,  setShowNewFolder]  = useState(false);
  const [newFolderName,  setNewFolderName]  = useState('');
  const [nfDropOpen,     setNfDropOpen]     = useState(false);
  const [nfDropStep,     setNfDropStep]     = useState('company');
  const [nfDropCompany,  setNfDropCompany]  = useState(null);
  const [nfCoSearch,     setNfCoSearch]     = useState('');
  const [newFolderProduct, setNewFolderProduct] = useState('');
  const nfDropRef = useRef(null);

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

  const pdFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !pdCoSearch || name.toLowerCase().includes(pdCoSearch.toLowerCase());
  });
  const fdFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !fdCoSearch || name.toLowerCase().includes(fdCoSearch.toLowerCase());
  });
  const nfFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !nfCoSearch || name.toLowerCase().includes(nfCoSearch.toLowerCase());
  });
  const nfCompanyProducts = nfDropCompany
    ? (products || []).filter(p => p.companyEn === nfDropCompany.en || p.companyJp === nfDropCompany.jp)
    : [];
  const nfSelectedProduct = (products || []).find(p => (p._awid || p.id) === newFolderProduct);
  const nfTriggerLabel = nfSelectedProduct
    ? `${lang === 'en' ? (nfSelectedProduct.companyEn || '') : (nfSelectedProduct.companyJp || nfSelectedProduct.companyEn || '')} › ${lang === 'en' ? nfSelectedProduct.en : (nfSelectedProduct.jp || nfSelectedProduct.en)}`
    : (t.selectProduct || 'Select a product...');

  const recentFolders = (folderRows || [])
    .slice(0, 10)
    .filter(f => !folderSearch || (lang === 'en' ? f.en : f.jp)?.toLowerCase().includes(folderSearch.toLowerCase()));

  // Form state
  const [form, setForm] = useState({
    company:    initialCompany ? (lang === 'en' ? initialCompany.en : (initialCompany.jp || initialCompany.en)) : '',
    companyRef: initialCompany || null,
    product:    '',
    websiteUrl: '',
    industry:   '',
    employees:  '',
    revenueScale: '',
    brandConcept: '',
    releaseDate:  '',
    price:        '',
    targetCustomers: '',
    differentiationPoints: '',
    productSpecifications: '',
    brandStrategy: '',
    usageScenes: '',
    customerInsight: '',
    priceJustification: '',
    salesScale: '',
    costStructure: '',
    pastPromotion: '',
    salesChannels: '',
    swotAnalysis: '',
    futureOutlook: '',
    notes: '',
  });

  function setField(key, val) { setForm(prev => ({ ...prev, [key]: val })); }
  function handleSave() { if (onSave) onSave(form); }

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

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

          <button className="cp-nav-item" title={t.companies} onClick={() => onNavigate('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>
            </svg>
            {!collapsed && t.companies}
          </button>

          {/* Products — active, expandable */}
          <button className="cp-nav-item cp-nav-item--active cp-nav-item--expand" title={t.products} onClick={() => { if (!collapsed) setProductsOpen(o => !o); }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              {!collapsed && (t.products || 'Products')}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>

          {!collapsed && productsOpen && (
            <div className="np-pd-panel">
              <div className="np-pd-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="np-pd-search" placeholder={t.searchCompany || 'Search company...'} value={pdCoSearch} onChange={e => setPdCoSearch(e.target.value)} />
              </div>
              <div className="np-pd-section-label">COMPANY</div>
              <div className="np-pd-list">
                {pdFilteredCompanies.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate('companies', c)}>
                    <div className="np-pd-item-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>
                      </svg>
                    </div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {pdFilteredCompanies.length === 0 && <div className="np-pd-empty">{t.noCompanies || 'No companies'}</div>}
              </div>
            </div>
          )}

          {/* Folders — expandable */}
          <button className="cp-nav-item cp-nav-item--expand" title={t.folders} onClick={() => { if (!collapsed) { setFoldersOpen(o => !o); setFdCoSearch(''); } }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {!collapsed && t.folders}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: foldersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>

          {!collapsed && foldersOpen && (
            <div className="np-pd-panel">
              <div className="np-pd-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="np-pd-search" placeholder={t.searchCompany || 'Search company...'} value={fdCoSearch} onChange={e => setFdCoSearch(e.target.value)} />
              </div>
              <div className="np-pd-section-label">COMPANY</div>
              <div className="np-pd-list">
                {fdFilteredCompanies.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate('companies', c)}>
                    <div className="np-pd-item-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {fdFilteredCompanies.length === 0 && <div className="np-pd-empty">{t.noCompanies || 'No companies'}</div>}
              </div>
            </div>
          )}

        </nav>

        {/* Recent Folders & Files */}
        {!collapsed && <>
          <button className="np-section-label cp-section-label--btn" style={{ marginTop: '12px' }} onClick={() => setRecentFoldersOpen(o => !o)}>
            {t.recentFolders}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginLeft: 'auto', transform: recentFoldersOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          {recentFoldersOpen && (
            <>
              <div className="np-folder-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="np-folder-search" placeholder={t.searchFolders || 'Search folders...'} value={folderSearch} onChange={e => setFolderSearch(e.target.value)} />
              </div>
              <div className="np-folder-list">
                {recentFolders.length === 0 && <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>{t.noFoldersYet}</div>}
                {recentFolders.map((f, i) => (
                  <button key={i} className="np-folder-item" onClick={() => onNavigate('folders')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    {lang === 'en' ? f.en : f.jp}
                  </button>
                ))}
              </div>
            </>
          )}

          <button className="np-section-label cp-section-label--btn" onClick={() => setRecentFilesOpen(o => !o)}>
            {t.recentFiles}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginLeft: 'auto', transform: recentFilesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          {recentFilesOpen && (
            <>
              <div className="np-folder-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="np-folder-search" placeholder="Search files..." value={fileSearch} onChange={e => setFileSearch(e.target.value)} />
              </div>
              <div className="np-folder-list">
                {(fileRows || []).filter(f => f.type === 'Chat' && (!fileSearch || (f.en || '').toLowerCase().includes(fileSearch.toLowerCase()))).length === 0 && (
                  <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>No files yet</div>
                )}
                {(fileRows || [])
                  .filter(f => f.type === 'Chat' && (!fileSearch || (f.en || '').toLowerCase().includes(fileSearch.toLowerCase())))
                  .slice(0, 8)
                  .map((f, i) => (
                    <button key={i} className="np-folder-item np-file-item" onClick={() => onNavigate('newChat')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span className="np-file-item-name">{lang === 'en' ? f.en : (f.jp || f.en)}</span>
                    </button>
                  ))}
              </div>
            </>
          )}
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
              <div className="cp-version">v1.2.0</div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="acp-main">

        <div className="acp-header">
          <div className="acp-breadcrumb">
            <button className="acp-breadcrumb-icon-btn" onClick={onBack} title="Products">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="acp-breadcrumb-page">Add Product</span>
          </div>
        </div>

        <div className="acp-scroll">
          <div className="acp-content">

            <div className="acp-card">
              <div className="acp-card-title acp-card-title--blue">Product Information</div>
              <div className="acp-card-subtitle">Add the core product details for this company and sales flow.</div>

              <div className="acp-form-grid">

                <div className="acp-field">
                  <label className="acp-label">Company</label>
                  <select
                    className="acp-input"
                    value={form.companyRef ? (form.companyRef._awid || form.companyRef.id || '') : ''}
                    onChange={e => {
                      const selected = (companies || []).find(c => (c._awid || c.id) === e.target.value);
                      setForm(prev => ({
                        ...prev,
                        company: selected ? (lang === 'en' ? selected.en : (selected.jp || selected.en)) : '',
                        companyRef: selected || null,
                      }));
                    }}
                  >
                    <option value="">Select company...</option>
                    {(companies || []).map(c => (
                      <option key={c._awid || c.id} value={c._awid || c.id}>
                        {lang === 'en' ? c.en : (c.jp || c.en)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="acp-field">
                  <label className="acp-label">Product</label>
                  <input className="acp-input" type="text" value={form.product} onChange={e => setField('product', e.target.value)} placeholder="Product name" />
                </div>

                <div className="acp-field">
                  <label className="acp-label">Website URL</label>
                  <input className="acp-input" type="text" value={form.websiteUrl} onChange={e => setField('websiteUrl', e.target.value)} placeholder="https://" />
                </div>
                <div className="acp-field">
                  <label className="acp-label">Industry</label>
                  <input className="acp-input" type="text" value={form.industry} onChange={e => setField('industry', e.target.value)} />
                </div>

                <div className="acp-field">
                  <label className="acp-label">Employees</label>
                  <input className="acp-input" type="text" value={form.employees} onChange={e => setField('employees', e.target.value)} />
                </div>
                <div className="acp-field">
                  <label className="acp-label">Revenue Scale</label>
                  <input className="acp-input" type="text" value={form.revenueScale} onChange={e => setField('revenueScale', e.target.value)} />
                </div>

                <div className="acp-field acp-field--full">
                  <label className="acp-label">Brand Concept</label>
                  <textarea className="acp-textarea acp-textarea--short" value={form.brandConcept} onChange={e => setField('brandConcept', e.target.value)} />
                </div>

                <div className="acp-field">
                  <label className="acp-label">Release Date</label>
                  <input className="acp-input" type="text" placeholder="YYYY/MM/DD" value={form.releaseDate} onChange={e => setField('releaseDate', e.target.value)} />
                </div>
                <div className="acp-field">
                  <label className="acp-label">Price</label>
                  <input className="acp-input" type="text" value={form.price} onChange={e => setField('price', e.target.value)} />
                </div>

                {[
                  ['targetCustomers',      'Target Customers (Segment)'],
                  ['differentiationPoints','Differentiation Points / USP'],
                  ['productSpecifications','Product Specifications / Service Specifications'],
                  ['brandStrategy',        'Brand Strategy / Tone & Manner'],
                  ['usageScenes',          'Usage Scenes / Purchase Scenes'],
                  ['customerInsight',      'Customer Insight'],
                  ['priceJustification',   'Price Justification Factors'],
                  ['salesScale',           'Sales Scale / Market Share'],
                  ['costStructure',        'Cost Structure / Resource Structure'],
                  ['pastPromotion',        'Past Promotion Records'],
                  ['salesChannels',        'Sales Channels / Distribution Channels'],
                  ['swotAnalysis',         'SWOT Analysis'],
                  ['futureOutlook',        'Future Outlook / Product Strategy (Roadmap)'],
                  ['notes',                'Notes'],
                ].map(([key, label]) => (
                  <div key={key} className="acp-field acp-field--full">
                    <label className="acp-label">{label}</label>
                    <textarea className="acp-textarea acp-textarea--short" value={form[key]} onChange={e => setField(key, e.target.value)} />
                  </div>
                ))}

              </div>
            </div>

            <div className="app-sticky-footer">
              <button className="app-sticky-footer-back" onClick={onBack}>Back</button>
              <button className="app-sticky-footer-register" onClick={handleSave}>Register</button>
            </div>

          </div>
        </div>

      </main>

      {/* New Folder Modal */}
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
                <div className="nf-drop" ref={nfDropRef}>
                  <button type="button" className={`nf-drop-trigger${nfDropOpen ? ' nf-drop-trigger--open' : ''}${newFolderProduct ? ' nf-drop-trigger--selected' : ''}`}
                    onClick={() => { setNfDropOpen(o => !o); setNfDropStep('company'); setNfCoSearch(''); }}>
                    <span className={newFolderProduct ? 'nf-drop-value' : 'nf-drop-placeholder'}>{nfTriggerLabel}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: nfDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {nfDropOpen && (
                    <div className="nf-drop-panel">
                      {nfDropStep === 'company' && (<>
                        <div className="nf-drop-search-wrap">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <input className="nf-drop-search" placeholder={t.searchCompany || 'Search company...'} value={nfCoSearch} onChange={e => setNfCoSearch(e.target.value)} autoFocus />
                        </div>
                        <div className="nf-drop-list">
                          {nfFilteredCompanies.map(c => (
                            <button key={c.id} type="button" className="nf-drop-item" onClick={() => { setNfDropCompany(c); setNfDropStep('product'); }}>
                              <div className="nf-drop-item-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                              <span className="nf-drop-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                          ))}
                          {nfFilteredCompanies.length === 0 && <div className="nf-drop-empty">{t.noCompanies || 'No companies'}</div>}
                        </div>
                      </>)}
                      {nfDropStep === 'product' && (<>
                        <button type="button" className="nf-drop-back" onClick={() => { setNfDropStep('company'); setNfCoSearch(''); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                          <span>{lang === 'en' ? nfDropCompany?.en : (nfDropCompany?.jp || nfDropCompany?.en)}</span>
                        </button>
                        <div className="nf-drop-list">
                          {nfCompanyProducts.map((p, i) => (
                            <button key={i} type="button" className="nf-drop-item" onClick={() => { setNewFolderProduct(p._awid || p.id); setNfDropOpen(false); }}>
                              <div className="nf-drop-item-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
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
              <button className="np-modal-create" onClick={resetNewFolder}>{t.createFolder}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
