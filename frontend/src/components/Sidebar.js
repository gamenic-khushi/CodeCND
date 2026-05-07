import { useState, useRef, useEffect } from 'react';
import translations from '../translations';
import { CompanyIcon, ProductIcon, FolderIcon, ChatIcon } from '../icons';
import './Sidebar.css';

/**
 * Shared Sidebar component.
 *
 * Props:
 *   activePage    'notification' | 'newChat' | 'companies' | 'folders' | 'addFile' | 'matrixGen'
 *   lang          'en' | 'jp'
 *   user          { name?, email? }
 *   companies     array
 *   products      array
 *   folderRows    array
 *   fileRows      array  (type === 'Chat' items are shown in Recent Files)
 *   onNavigate    (section, data?) => void
 *   onLogout      () => void
 *   onToggleLang  () => void
 *   onOpenFolder  (folder) => void
 *   onOpenFile    (file)   => void
 *   onCreateFolder ({ name, productId }) => void
 */
export default function Sidebar({
  activePage,
  lang,
  user,
  companies,
  products,
  folderRows,
  fileRows,
  onNavigate,
  onLogout,
  onToggleLang,
  onOpenFolder,
  onOpenFile,
  onCreateFolder,
}) {
  const t = translations[lang];

  // ── internal state ──────────────────────────────────────────────────────────
  const [collapsed,         setCollapsed]         = useState(false);
  const [productsOpen,      setProductsOpen]      = useState(false);
  const [productSearch,     setProductSearch]     = useState('');
  const [foldersOpen,       setFoldersOpen]       = useState(false);
  const [fdStep,            setFdStep]            = useState('company');   // 'company' | 'product'
  const [fdDropCompany,     setFdDropCompany]     = useState(null);
  const [fdCoSearch,        setFdCoSearch]        = useState('');
  const [fdPrSearch,        setFdPrSearch]        = useState('');
  const [langOpen,          setLangOpen]          = useState(false);
  const [recentFoldersOpen, setRecentFoldersOpen] = useState(true);
  const [recentFilesOpen,   setRecentFilesOpen]   = useState(true);
  const [folderSearch,      setFolderSearch]      = useState('');
  const [fileSearch,        setFileSearch]        = useState('');

  // New Folder modal state
  const [showNewFolder,    setShowNewFolder]    = useState(false);
  const [newFolderName,    setNewFolderName]    = useState('');
  const [newFolderProduct, setNewFolderProduct] = useState('');
  const [nfDropOpen,       setNfDropOpen]       = useState(false);
  const [nfDropStep,       setNfDropStep]       = useState('company');
  const [nfDropCompany,    setNfDropCompany]    = useState(null);
  const [nfCoSearch,       setNfCoSearch]       = useState('');
  const nfDropRef = useRef(null);

  useEffect(() => {
    if (!nfDropOpen) return;
    function outside(e) {
      if (nfDropRef.current && !nfDropRef.current.contains(e.target)) setNfDropOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [nfDropOpen]);

  function resetNewFolder() {
    setShowNewFolder(false); setNewFolderName(''); setNewFolderProduct('');
    setNfDropOpen(false); setNfDropStep('company'); setNfDropCompany(null); setNfCoSearch('');
  }

  // ── derived values ──────────────────────────────────────────────────────────
  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  // Products panel — filtered company list
  const pdFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !productSearch || name.toLowerCase().includes(productSearch.toLowerCase());
  });

  // Folders two-step panel
  const fdFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !fdCoSearch || name.toLowerCase().includes(fdCoSearch.toLowerCase());
  });
  const fdCompanyProducts = fdDropCompany
    ? (products || []).filter(p => {
        const enMatch = p.companyEn && fdDropCompany.en && p.companyEn.toLowerCase() === fdDropCompany.en.toLowerCase();
        const idMatch = p.companyId && (p.companyId === fdDropCompany._awid || p.companyId === fdDropCompany.id);
        return enMatch || idMatch;
      }).filter(p => !fdPrSearch || (p.en || '').toLowerCase().includes(fdPrSearch.toLowerCase()))
    : [];

  // Recent folders / files
  const recentFolders = (folderRows || [])
    .filter(f => !folderSearch || (lang === 'en' ? f.en : (f.jp || f.en))?.toLowerCase().includes(folderSearch.toLowerCase()))
    .slice(0, 10);

  const chatFiles = (fileRows || [])
    .filter(f => f.type === 'Chat' && (!fileSearch || (f.en || '').toLowerCase().includes(fileSearch.toLowerCase())))
    .slice(0, 8);

  // New folder modal — dropdown derived values
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

  // ── helpers ─────────────────────────────────────────────────────────────────
  function handleFoldersToggle() {
    if (collapsed) return;
    setFoldersOpen(o => {
      if (o) { setFdStep('company'); setFdDropCompany(null); setFdPrSearch(''); }
      return !o;
    });
    setFdCoSearch('');
  }

  function handleProductsToggle() {
    if (collapsed) return;
    setProductsOpen(o => !o);
    setProductSearch('');
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <aside className={`cp-sidebar${collapsed ? ' cp-sidebar--collapsed' : ''}`}>

        {/* Header */}
        <div className="cp-sidebar-header">
          {!collapsed && <span className="cp-sidebar-brand">ChatCND</span>}
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setCollapsed(c => !c)}
          >
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </div>

        {!collapsed && <div className="cp-section-label">{t.menu}</div>}

        <nav className="cp-nav">

          {/* New Chat */}
          <button
            className={`cp-nav-item${activePage === 'newChat' ? ' cp-nav-item--active' : ''}`}
            title={t.newChat}
            onClick={() => activePage !== 'newChat' && onNavigate('newChat')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!collapsed && t.newChat}
          </button>

          {/* New Folder */}
          <button className="cp-nav-item" title={t.newFolder} onClick={() => setShowNewFolder(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {!collapsed && t.newFolder}
          </button>

          {/* Notification */}
          <button
            className={`cp-nav-item${activePage === 'notification' ? ' cp-nav-item--active' : ''}`}
            title={t.notification}
            onClick={() => activePage !== 'notification' && onNavigate('notification')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!collapsed && t.notification}
          </button>

          {/* Companies */}
          <button
            className={`cp-nav-item${activePage === 'companies' ? ' cp-nav-item--active' : ''}`}
            title={t.companies}
            onClick={() => activePage !== 'companies' && onNavigate('companies')}
          >
            <CompanyIcon size={16} />
            {!collapsed && t.companies}
          </button>

          {/* Products — expandable with company search */}
          <button
            className="cp-nav-item cp-nav-item--expand"
            title={t.products}
            onClick={handleProductsToggle}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ProductIcon size={16} />
              {!collapsed && t.products}
            </span>
            {!collapsed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            )}
          </button>

          {!collapsed && productsOpen && (
            <div className="cp-sub-panel">
              <div className="cp-sub-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="cp-sub-search"
                  placeholder={t.searchCompany || 'Search company...'}
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              <div className="cp-sub-label">COMPANY</div>
              <div className="cp-sub-list">
                {pdFilteredCompanies.map((c, i) => (
                  <button key={i} className="cp-sub-item" onClick={() => { onNavigate('companies', c); setProductsOpen(false); }}>
                    <div className="cp-sub-item-icon"><CompanyIcon size={13} stroke="#6366f1" /></div>
                    <span className="cp-sub-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
                {pdFilteredCompanies.length === 0 && (
                  <div className="cp-sub-empty">{t.noCompanies || 'No companies found'}</div>
                )}
              </div>
            </div>
          )}

          {/* Folders — two-step company → product */}
          <button
            className={`cp-nav-item cp-nav-item--expand${activePage === 'folders' ? ' cp-nav-item--active' : ''}`}
            title={t.folders}
            onClick={handleFoldersToggle}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderIcon size={16} />
              {!collapsed && t.folders}
            </span>
            {!collapsed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: foldersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            )}
          </button>

          {!collapsed && foldersOpen && (
            <div className="cp-sub-panel">
              {fdStep === 'company' && (
                <>
                  <div className="cp-sub-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      className="cp-sub-search"
                      placeholder={t.searchCompany || 'Search company...'}
                      value={fdCoSearch}
                      onChange={e => setFdCoSearch(e.target.value)}
                    />
                  </div>
                  <div className="cp-sub-label">COMPANY</div>
                  <div className="cp-sub-list">
                    {fdFilteredCompanies.map((c, i) => (
                      <button key={i} className="cp-sub-item" onClick={() => { setFdDropCompany(c); setFdStep('product'); setFdPrSearch(''); }}>
                        <div className="cp-sub-item-icon"><CompanyIcon size={13} stroke="#6366f1" /></div>
                        <span className="cp-sub-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    ))}
                    {fdFilteredCompanies.length === 0 && (
                      <div className="cp-sub-empty">{t.noCompanies || 'No companies found'}</div>
                    )}
                  </div>
                </>
              )}

              {fdStep === 'product' && (
                <>
                  <button
                    className="nf-drop-back"
                    style={{ padding: '6px 8px', width: '100%', textAlign: 'left' }}
                    onClick={() => { setFdStep('company'); setFdCoSearch(''); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    <span>{lang === 'en' ? fdDropCompany?.en : (fdDropCompany?.jp || fdDropCompany?.en)}</span>
                  </button>
                  <div className="cp-sub-search-wrap" style={{ marginTop: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      className="cp-sub-search"
                      placeholder={t.searchProduct || 'Search product...'}
                      value={fdPrSearch}
                      onChange={e => setFdPrSearch(e.target.value)}
                    />
                  </div>
                  <div className="cp-sub-label">PRODUCT</div>
                  <div className="cp-sub-list">
                    {fdCompanyProducts.map((p, i) => (
                      <button key={i} className="cp-sub-item" onClick={() => {
                        onNavigate('folders', { company: fdDropCompany, product: p });
                        setFoldersOpen(false);
                        setFdStep('company');
                      }}>
                        <div className="cp-sub-item-icon"><ProductIcon size={13} stroke="#6366f1" /></div>
                        <span className="cp-sub-item-name">{lang === 'en' ? p.en : (p.jp || p.en)}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    ))}
                    {fdCompanyProducts.length === 0 && (
                      <div className="cp-sub-empty">{t.noProducts || 'No products'}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </nav>

        {/* Recent Folders */}
        {!collapsed && (
          <>
            <button
              className="cp-section-label cp-section-label--btn"
              style={{ marginTop: 12 }}
              onClick={() => setRecentFoldersOpen(o => !o)}
            >
              {t.recentFolders}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginLeft: 'auto', transform: recentFoldersOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {recentFoldersOpen && (
              <>
                <div className="cp-folder-search-wrap">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="cp-folder-search"
                    placeholder={t.searchFolders || 'Search folders...'}
                    value={folderSearch}
                    onChange={e => setFolderSearch(e.target.value)}
                  />
                </div>
                <div className="cp-folder-list">
                  {recentFolders.length === 0 && (
                    <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>{t.noFoldersYet || 'No folders yet'}</div>
                  )}
                  {recentFolders.map((f, i) => (
                    <button key={i} className="cp-folder-item" onClick={() => onOpenFolder?.(f)}>
                      <FolderIcon size={14} />
                      {lang === 'en' ? f.en : (f.jp || f.en)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Recent Files */}
            <button
              className="cp-section-label cp-section-label--btn"
              onClick={() => setRecentFilesOpen(o => !o)}
            >
              {t.recentFiles}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginLeft: 'auto', transform: recentFilesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {recentFilesOpen && (
              <>
                <div className="cp-folder-search-wrap">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="cp-folder-search"
                    placeholder="Search files..."
                    value={fileSearch}
                    onChange={e => setFileSearch(e.target.value)}
                  />
                </div>
                <div className="cp-folder-list">
                  {chatFiles.length === 0 && (
                    <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>No files yet</div>
                  )}
                  {chatFiles.map((f, i) => (
                    <button key={i} className="cp-folder-item" onClick={() => onOpenFile?.(f)}>
                      <ChatIcon size={14} />
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'en' ? f.en : (f.jp || f.en)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <div className="cp-sidebar-footer">
          {collapsed ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
              <div className="cp-lang-row" style={{ position: 'relative' }}>
                {langOpen && (
                  <div className="cp-lang-dropdown">
                    <button
                      className={`cp-lang-option${lang === 'en' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'en') onToggleLang?.(); setLangOpen(false); }}
                    >
                      <span className="cp-lang-badge">EN</span>{t.english}
                      {lang === 'en' && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                    <button
                      className={`cp-lang-option${lang === 'jp' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'jp') onToggleLang?.(); setLangOpen(false); }}
                    >
                      <span className="cp-lang-badge">JP</span>{t.japanese}
                      {lang === 'jp' && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  </div>
                )}
                <button className="cp-lang-btn" onClick={() => setLangOpen(o => !o)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>{lang === 'en' ? t.english : t.japanese}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ marginLeft: 'auto', transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
              <div className="cp-version">v1.2.0</div>
            </>
          )}
        </div>

      </aside>

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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, transform: nfDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {nfDropOpen && (
                    <div className="nf-drop-panel">
                      {nfDropStep === 'company' && (
                        <>
                          <div className="nf-drop-search-wrap">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
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
                                <div className="nf-drop-item-icon"><CompanyIcon size={13} stroke="#6366f1" /></div>
                                <span className="nf-drop-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                                  <polyline points="9 18 15 12 9 6"/>
                                </svg>
                              </button>
                            ))}
                            {nfFilteredCompanies.length === 0 && (
                              <div className="nf-drop-empty">{t.noCompanies || 'No companies found'}</div>
                            )}
                          </div>
                        </>
                      )}

                      {nfDropStep === 'product' && (
                        <>
                          <button type="button" className="nf-drop-back" onClick={() => { setNfDropStep('company'); setNfCoSearch(''); }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 18 9 12 15 6"/>
                            </svg>
                            <span>{lang === 'en' ? nfDropCompany?.en : (nfDropCompany?.jp || nfDropCompany?.en)}</span>
                          </button>
                          <div className="nf-drop-list">
                            {nfCompanyProducts.map((p, i) => (
                              <button key={i} type="button" className="nf-drop-item"
                                onClick={() => { setNewFolderProduct(p._awid || p.id); setNfDropOpen(false); }}>
                                <div className="nf-drop-item-icon"><ProductIcon size={13} stroke="#6366f1" /></div>
                                <span className="nf-drop-item-name">{lang === 'en' ? p.en : (p.jp || p.en)}</span>
                              </button>
                            ))}
                            {nfCompanyProducts.length === 0 && (
                              <div className="nf-drop-empty">{t.noProducts || 'No products'}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="np-modal-field">
                <label className="np-modal-label">{t.folderName}</label>
                <input
                  className="np-modal-input"
                  placeholder="e.g. Spring Campaign 2026"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="np-modal-footer">
              <button className="np-modal-cancel" onClick={resetNewFolder}>{t.cancel}</button>
              <button className="np-modal-create" onClick={() => {
                if (newFolderName.trim() && onCreateFolder) {
                  onCreateFolder({ name: newFolderName.trim(), productId: newFolderProduct });
                }
                resetNewFolder();
              }}>{t.createFolder}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
