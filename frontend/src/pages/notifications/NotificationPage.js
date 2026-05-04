import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';

const UPDATES = [
  {
    version: 'v1.2.0', date: '2026-03-20',
    en: { title: 'Folder Management Improvements',   desc: 'Added folder sorting, search filters, and batch operations. UI responsiveness has also been improved.' },
    jp: { title: 'フォルダ管理の改善',                 desc: 'フォルダの並び替え、検索フィルタ、一括操作を追加しました。UIのレスポンシブ性も改善されました。' },
  },
  {
    version: 'v1.1.2', date: '2026-03-15',
    en: { title: 'Performance Optimization',         desc: 'Improved loading speed of company and product lists by 40%.' },
    jp: { title: 'パフォーマンス最適化',               desc: '企業・プロダクト一覧の読み込み速度を40%改善しました。' },
  },
  {
    version: 'v1.1.0', date: '2026-03-08',
    en: { title: 'Company Data Export',              desc: 'Company data can now be exported in CSV and Excel formats.' },
    jp: { title: '企業データのエクスポート',            desc: '企業データをCSVおよびExcel形式でエクスポートできるようになりました。' },
  },
  {
    version: 'v1.0.1', date: '2026-03-01',
    en: { title: 'Bug Fixes and UI Adjustments',     desc: 'Fixed sidebar display issues and improved modal responsiveness.' },
    jp: { title: 'バグ修正とUI調整',                   desc: 'サイドバーの表示問題を修正し、モーダルのレスポンシブ性を改善しました。' },
  },
];

export default function NotificationPage({ lang, user, folderRows, fileRows, products, companies, onNavigate, onLogout, onNewChat, onCreateFolder, onToggleLang }) {
  const t = translations[lang];

  const [productsOpen,      setProductsOpen]      = useState(false);
  const [pdCoSearch,        setPdCoSearch]        = useState('');
  const [foldersOpen,       setFoldersOpen]       = useState(false);
  const [fdCoSearch,        setFdCoSearch]        = useState('');
  const [collapsed,         setCollapsed]         = useState(false);
  const [langOpen,          setLangOpen]          = useState(false);
  const [recentFoldersOpen, setRecentFoldersOpen] = useState(true);
  const [recentFilesOpen,   setRecentFilesOpen]   = useState(false);
  const [folderSearch,      setFolderSearch]      = useState('');
  const [showNewFolder,     setShowNewFolder]     = useState(false);
  const [newFolderName,     setNewFolderName]     = useState('');
  const [newFolderProduct,  setNewFolderProduct]  = useState('');
  // Custom two-step dropdown
  const [nfDropOpen,    setNfDropOpen]    = useState(false);
  const [nfDropStep,    setNfDropStep]    = useState('company');
  const [nfDropCompany, setNfDropCompany] = useState(null);
  const [nfCoSearch,    setNfCoSearch]    = useState('');
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

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const recentFolders = (folderRows || [])
    .slice(0, 10)
    .filter(f => !folderSearch || (lang === 'en' ? f.en : f.jp)?.toLowerCase().includes(folderSearch.toLowerCase()));

  return (
    <div className="np-layout">

      {/* ── Sidebar ── */}
      <aside className={`np-sidebar${collapsed ? ' np-sidebar--collapsed' : ''}`}>

        {/* Header */}
        <div className="np-sidebar-header">
          {!collapsed && <span className="np-sidebar-brand">ChatCND</span>}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setCollapsed(c => !c)}>
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </div>

        {!collapsed && <div className="np-section-label">{t.menu}</div>}
        <nav className="np-nav">

          <button className="np-nav-item" title={t.newChat} onClick={onNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!collapsed && t.newChat}
          </button>

          <button className="np-nav-item" title={t.newFolder} onClick={() => setShowNewFolder(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {!collapsed && t.newFolder}
          </button>

          <button className="np-nav-item np-nav-item--active" title={t.notification}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!collapsed && t.notification}
          </button>

          <button className="np-nav-item" title={t.companies} onClick={() => onNavigate('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {!collapsed && t.companies}
          </button>

          <button className="np-nav-item np-nav-item--expand" title={t.products} onClick={() => { if (!collapsed) { setProductsOpen(o => !o); setPdCoSearch(''); } }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              {!collapsed && t.products}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>

          {!collapsed && productsOpen && (
            <div className="np-pd-panel">
              <div className="np-pd-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  className="np-pd-search"
                  placeholder={t.searchCompany || 'Search company...'}
                  value={pdCoSearch}
                  onChange={e => setPdCoSearch(e.target.value)}
                />
              </div>
              <div className="np-pd-section-label">COMPANY</div>
              <div className="np-pd-list">
                {pdFilteredCompanies.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate('companies')}>
                    <div className="np-pd-item-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {pdFilteredCompanies.length === 0 && (
                  <div className="np-pd-empty">{t.noCompanies || 'No companies found'}</div>
                )}
              </div>
            </div>
          )}

          <button className="np-nav-item np-nav-item--expand" title={t.folders} onClick={() => { if (!collapsed) { setFoldersOpen(o => !o); setFdCoSearch(''); } }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <input
                  className="np-pd-search"
                  placeholder={t.searchCompany || 'Search company...'}
                  value={fdCoSearch}
                  onChange={e => setFdCoSearch(e.target.value)}
                />
              </div>
              <div className="np-pd-section-label">COMPANY</div>
              <div className="np-pd-list">
                {fdFilteredCompanies.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate('folders')}>
                    <div className="np-pd-item-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {fdFilteredCompanies.length === 0 && (
                  <div className="np-pd-empty">{t.noCompanies || 'No companies found'}</div>
                )}
              </div>
            </div>
          )}

        </nav>

        {/* Recent Folders / Files — collapsible */}
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
                <input
                  className="np-folder-search"
                  placeholder={t.searchFolders || 'Search folders...'}
                  value={folderSearch}
                  onChange={e => setFolderSearch(e.target.value)}
                />
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
            <div className="np-folder-list">
              {(fileRows || []).length === 0 && (
                <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>{t.noFoldersYet || 'No files yet'}</div>
              )}
              {(fileRows || []).slice(0, 8).map((f, i) => (
                <button key={i} className="np-folder-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {lang === 'en' ? f.en : (f.jp || f.en)}
                </button>
              ))}
            </div>
          )}
        </>}

        {/* Footer */}
        <div className="np-sidebar-footer">
          {collapsed ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <div className="np-user-avatar">{displayName[0]?.toUpperCase()}</div>
            </>
          ) : (
            <>
              <div className="np-user-row">
                <div className="np-user-avatar">{displayName[0]?.toUpperCase()}</div>
                <div className="np-user-info">
                  <div className="np-user-name">{displayName}</div>
                  <div className="np-user-email">{displayEmail}</div>
                </div>
                <button className="np-logout-btn" onClick={onLogout} title="Logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
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
              <div className="np-version">{UPDATES[0]?.version}</div>
            </>
          )}
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="np-main">
        <div className="np-main-header">
          <h1 className="np-main-title">{t.notification}</h1>
        </div>

        <div className="np-content">
          <div className="np-update-section">
            <h2 className="np-update-title">{t.updateHistory}</h2>
            <p className="np-update-subtitle">{t.updateSubtitle}</p>

            <div className="np-cards">
              {UPDATES.map((u, i) => (
                <div key={i} className="np-card">
                  <div className="np-card-top">
                    <span className="np-version-badge">{u.version}</span>
                    <span className="np-card-date">{u.date}</span>
                  </div>
                  <div className="np-card-title">{lang === 'en' ? u.en.title : u.jp.title}</div>
                  <div className="np-card-desc">{lang === 'en' ? u.en.desc : u.jp.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── New Folder Modal ── */}
      {showNewFolder && (
        <div className="np-modal-backdrop" onClick={resetNewFolder}>
          <div className="np-modal" onClick={e => e.stopPropagation()}>

            <div className="np-modal-header">
              <span className="np-modal-title">{t.newFolder}</span>
              <button className="np-modal-close" onClick={resetNewFolder}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="np-modal-body">
              <div className="np-modal-field">
                <label className="np-modal-label">{t.product}</label>
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
                          <input className="nf-drop-search" placeholder={t.searchCompany || 'Search company...'} value={nfCoSearch} onChange={e => setNfCoSearch(e.target.value)} autoFocus />
                        </div>
                        <div className="nf-drop-list">
                          {nfFilteredCompanies.map(c => (
                            <button key={c.id} type="button" className="nf-drop-item" onClick={() => { setNfDropCompany(c); setNfDropStep('product'); }}>
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
                            <button key={i} type="button" className="nf-drop-item" onClick={() => { setNewFolderProduct(p._awid || p.id); setNfDropOpen(false); }}>
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
                if (newFolderName.trim() && onCreateFolder) onCreateFolder({ name: newFolderName.trim(), productId: newFolderProduct });
                resetNewFolder();
              }}>
                {t.createFolder}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
