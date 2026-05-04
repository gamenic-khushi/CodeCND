import { useState } from 'react';
import translations from '../../translations';

export default function FolderDetailPage({
  lang, user, folder, fileRows = [], folderRows = [], companies = [], products = [],
  onLogout, onToggleLang, onNavigate, onBack, onNewChat, onAddFile, onOpenMatrix,
}) {
  const t = translations[lang];
  const [activeTab, setActiveTab]       = useState('chat');
  const [collapsed, setCollapsed]       = useState(false);
  const [langOpen, setLangOpen]         = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [foldersOpen, setFoldersOpen]   = useState(true);
  const [pdCoSearch, setPdCoSearch]     = useState('');
  const [fdCoSearch, setFdCoSearch]     = useState('');
  const [recentFoldersOpen, setRecentFoldersOpen] = useState(false);
  const [recentFilesOpen, setRecentFilesOpen]     = useState(true);
  const [folderSearch, setFolderSearch] = useState('');
  const [fileSearch, setFileSearch]     = useState('');

  const folderName  = lang === 'en' ? folder.en  : (folder.jp  || folder.en);
  const companyName = lang === 'en' ? folder.companyEn : (folder.companyJp || folder.companyEn || '');
  const productName = lang === 'en' ? folder.productEn : (folder.productJp || folder.productEn || '');

  const folderFiles = fileRows.filter(f => f.folderId === folder.id || (folder._awid && f.folderId === folder._awid));
  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const pdFiltered = companies.filter(c => !pdCoSearch || (lang === 'en' ? c.en : c.jp || c.en).toLowerCase().includes(pdCoSearch.toLowerCase()));
  const fdFiltered = companies.filter(c => !fdCoSearch || (lang === 'en' ? c.en : c.jp || c.en).toLowerCase().includes(fdCoSearch.toLowerCase()));
  const recentFolders = folderRows.filter(f => !folderSearch || (f.en || '').toLowerCase().includes(folderSearch.toLowerCase())).slice(0, 10);
  const recentFiles   = fileRows.filter(f => !fileSearch || (f.en || '').toLowerCase().includes(fileSearch.toLowerCase())).slice(0, 8);

  return (
    <div className="fd-layout">

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
          <button className="cp-nav-item" onClick={() => onNavigate?.('newChat')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!collapsed && t.newChat}
          </button>

          <button className="cp-nav-item" onClick={() => onNavigate?.('newFolder')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {!collapsed && t.newFolder}
          </button>

          <button className="cp-nav-item" onClick={() => onNavigate?.('notification')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!collapsed && t.notification}
          </button>

          <button className="cp-nav-item" onClick={() => onNavigate?.('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {!collapsed && t.companies}
          </button>

          {/* Products */}
          <button className="cp-nav-item cp-nav-item--expand" onClick={() => { if (!collapsed) { setProductsOpen(o => !o); setPdCoSearch(''); } }}>
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
            <div className="np-pd-panel">
              <div className="np-pd-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="np-pd-search" placeholder={t.searchCompany || 'Search company...'} value={pdCoSearch} onChange={e => setPdCoSearch(e.target.value)} />
              </div>
              <div className="np-pd-section-label">COMPANY</div>
              <div className="np-pd-list">
                {pdFiltered.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate?.('companies')}>
                    <div className="np-pd-item-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {pdFiltered.length === 0 && <div className="np-pd-empty">{t.noCompanies || 'No companies'}</div>}
              </div>
            </div>
          )}

          {/* Folders — active */}
          <button className="cp-nav-item cp-nav-item--expand cp-nav-item--active" onClick={() => { if (!collapsed) { setFoldersOpen(o => !o); setFdCoSearch(''); } }}>
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
                {fdFiltered.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate?.('companies')}>
                    <div className="np-pd-item-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {fdFiltered.length === 0 && <div className="np-pd-empty">{t.noCompanies || 'No companies'}</div>}
              </div>
            </div>
          )}
        </nav>

        {/* Recent Folders */}
        {!collapsed && (
          <>
            <button className="np-section-label cp-section-label--btn" style={{ marginTop: 12 }} onClick={() => setRecentFoldersOpen(o => !o)}>
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
                    <button key={i} className="np-folder-item" onClick={() => onNavigate?.('folders')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      {lang === 'en' ? f.en : f.jp}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Recent Files */}
            <button className="np-section-label cp-section-label--btn" onClick={() => setRecentFilesOpen(o => !o)}>
              {t.recentFiles || 'RECENT FILES'}
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
                  {recentFiles.length === 0 && <div style={{ padding: '4px 16px', fontSize: 12, color: '#9098a9' }}>No files yet</div>}
                  {recentFiles.map((f, i) => (
                    <button key={i} className="np-folder-item np-file-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span className="np-file-item-name">{lang === 'en' ? f.en : (f.jp || f.en)}</span>
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
            <div className="cp-user-avatar">{displayName[0]?.toUpperCase()}</div>
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
      <main className="fd-main">

        {/* Breadcrumb */}
        <div className="fd-breadcrumb">
          {companyName && <>
            <div className="fd-bc-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>{companyName}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </>}
          {productName && <>
            <div className="fd-bc-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <span>{productName}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </>}
          <div className="fd-bc-item fd-bc-item--active">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>{folderName}</span>
          </div>
        </div>

        {/* Folder hero */}
        <div className="fd-hero">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <h1 className="fd-hero-name">{folderName}</h1>
        </div>

        {/* New chat bar */}
        <div className="fd-new-chat-bar" onClick={() => onNewChat?.()}>
          <button className="fd-plus-btn" onClick={e => { e.stopPropagation(); onNewChat?.(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <span className="fd-new-chat-label">{lang === 'en' ? `New chat in ${folderName}` : `${folderName}で新しいチャット`}</span>
        </div>

        {/* Tabs */}
        <div className="fd-tabs">
          <button className={`fd-tab${activeTab === 'chat' ? ' fd-tab--active' : ''}`} onClick={() => setActiveTab('chat')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {t.chat || 'Chat'}
          </button>
          <button className={`fd-tab${activeTab === 'file' ? ' fd-tab--active' : ''}`} onClick={() => setActiveTab('file')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {t.file || 'File'}
          </button>
          <button className={`fd-tab${activeTab === 'matrix' ? ' fd-tab--active' : ''}`} onClick={() => setActiveTab('matrix')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Matrix
          </button>
        </div>

        <div className="fd-divider" />

        {/* ── Chat tab ── */}
        {activeTab === 'chat' && (
          folderFiles.filter(f => f.type === 'Chat').length === 0 ? (
            <div className="fd-empty">
              <div className="fd-empty-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="fd-empty-text">{t.noChatsYet || 'No chats yet'}</p>
              <button className="fd-new-btn" onClick={() => onNewChat?.()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {lang === 'en' ? 'New chat' : '新しいチャット'}
              </button>
            </div>
          ) : (
            <div className="fd-file-list">
              {folderFiles.filter(f => f.type === 'Chat').map(f => (
                <div key={f.id} className="fd-file-row">
                  <div className="fd-file-icon-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div className="fd-file-info">
                    <span className="fd-file-name">{lang === 'en' ? f.en : (f.jp || f.en)}</span>
                    <span className="fd-file-ref">{f.refId}</span>
                  </div>
                  <span className="fd-file-type-badge">{f.type}</span>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── File tab ── */}
        {activeTab === 'file' && (
          folderFiles.filter(f => f.type !== 'Chat').length === 0 ? (
            <div className="fd-empty">
              <div className="fd-empty-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
              </div>
              <p className="fd-empty-text">{t.noFilesYet || 'No files yet'}</p>
              <button className="fd-new-btn" onClick={() => onAddFile?.()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {lang === 'en' ? '+ Add file' : 'ファイルを追加'}
              </button>
            </div>
          ) : (
            <div className="fd-file-list">
              {folderFiles.filter(f => f.type !== 'Chat').map(f => (
                <div key={f.id} className="fd-file-row">
                  <div className="fd-file-icon-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="fd-file-info">
                    <span className="fd-file-name">{lang === 'en' ? f.en : (f.jp || f.en)}</span>
                    <span className="fd-file-ref">{f.refId}</span>
                  </div>
                  <span className="fd-file-type-badge">{f.type}</span>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Matrix tab ── */}
        {activeTab === 'matrix' && (
          folderFiles.length === 0 ? (
            <div className="fd-empty">
              <div className="fd-empty-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <p className="fd-empty-text">No matrices yet</p>
              <button className="fd-new-btn" onClick={() => onOpenMatrix?.()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Generate matrix
              </button>
            </div>
          ) : (
            <div className="fd-matrix-list">
              {folderFiles.map(f => {
                const name = lang === 'en' ? f.en : (f.jp || f.en);
                const timeStr = f.savedAt ? new Date(f.savedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';
                return (
                  <div key={f.id} className="fd-matrix-item">
                    <div className="fd-matrix-header">
                      <span className="fd-matrix-dot" />
                      <span className="fd-matrix-title">{name}</span>
                      <span className="fd-matrix-done">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Done
                      </span>
                      <span className="fd-matrix-time">{timeStr}</span>
                    </div>
                    {f.prompt && <p className="fd-matrix-content">{f.prompt}</p>}
                  </div>
                );
              })}
            </div>
          )
        )}

      </main>
    </div>
  );
}
