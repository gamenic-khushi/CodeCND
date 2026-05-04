import { useState, useRef } from 'react';
import translations from '../../translations';

export default function AddFilePage({
  lang, user, folderRows = [], companies = [], fileRows = [],
  initialFolder, onBack, onLogout, onToggleLang, onNavigate, onUpload,
}) {
  const t = translations[lang];
  const [collapsed, setCollapsed]   = useState(false);
  const [langOpen, setLangOpen]     = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [foldersOpen, setFoldersOpen]   = useState(false);
  const [recentFilesOpen, setRecentFilesOpen] = useState(true);
  const [fileSearch, setFileSearch] = useState('');

  // Folder selection (drill-down simplified to flat for now)
  const [selectedFolderPath, setSelectedFolderPath] = useState(
    initialFolder
      ? [initialFolder.companyEn, initialFolder.productEn, initialFolder.en].filter(Boolean).join(' > ')
      : ''
  );
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolder?._awid || initialFolder?.id || '');
  const [folderDropOpen, setFolderDropOpen] = useState(false);
  const [folderSearch, setFolderSearch] = useState('');

  // File upload
  const [dragOver, setDragOver]     = useState(false);
  const [files, setFiles]           = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const recentFiles = (fileRows || [])
    .filter(f => !fileSearch || (f.en || '').toLowerCase().includes(fileSearch.toLowerCase()))
    .slice(0, 8);

  const filteredFolders = (folderRows || []).filter(f =>
    !folderSearch || (f.en || '').toLowerCase().includes(folderSearch.toLowerCase())
  );

  function handleFiles(newFiles) {
    const arr = Array.from(newFiles);
    setFiles(arr);
    if (arr[0] && arr[0].type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(arr[0]));
    } else {
      setPreviewUrl(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleUpload() {
    if (!files.length) return;
    if (onUpload) onUpload({ folderId: selectedFolderId, files });
  }

  function selectFolder(f) {
    const path = [f.companyEn, f.productEn, f.en].filter(Boolean).join(' > ');
    setSelectedFolderPath(path);
    setSelectedFolderId(f._awid || f.id);
    setFolderDropOpen(false);
    setFolderSearch('');
  }

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {!collapsed && t.newChat}
          </button>
          <button className="cp-nav-item" onClick={() => onNavigate?.('newFolder')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            {!collapsed && t.newFolder}
          </button>
          <button className="cp-nav-item" onClick={() => onNavigate?.('notification')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {!collapsed && t.notification}
          </button>
          <button className="cp-nav-item" onClick={() => onNavigate?.('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            {!collapsed && t.companies}
          </button>
          <button className="cp-nav-item cp-nav-item--expand" onClick={() => !collapsed && setProductsOpen(o => !o)}>
            <span style={{ display:'flex', alignItems:'center', gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              {!collapsed && t.products}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: productsOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>
          <button className="cp-nav-item cp-nav-item--expand" onClick={() => !collapsed && setFoldersOpen(o => !o)}>
            <span style={{ display:'flex', alignItems:'center', gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              {!collapsed && t.folders}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: foldersOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>
        </nav>

        {/* Recent Files */}
        {!collapsed && (
          <>
            <button className="np-section-label cp-section-label--btn" style={{ marginTop:12 }} onClick={() => setRecentFilesOpen(o => !o)}>
              {t.recentFiles || 'RECENT FILES'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginLeft:'auto', transform: recentFilesOpen?'rotate(90deg)':'none', transition:'transform 0.2s' }}>
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
                  {recentFiles.length === 0 && <div style={{ padding:'4px 16px', fontSize:12, color:'#9098a9' }}>No files yet</div>}
                  {recentFiles.map((f, i) => (
                    <button key={i} className="np-folder-item np-file-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
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
                <button className="cp-logout-btn" onClick={onLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
              <div className="cp-lang-row" style={{ position:'relative' }}>
                {langOpen && (
                  <div className="cp-lang-dropdown">
                    <button className={`cp-lang-option${lang==='en'?' cp-lang-option--active':''}`} onClick={() => { if (lang!=='en') onToggleLang?.(); setLangOpen(false); }}>
                      <span className="cp-lang-badge">EN</span>{t.english}
                      {lang==='en' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft:'auto' }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <button className={`cp-lang-option${lang==='jp'?' cp-lang-option--active':''}`} onClick={() => { if (lang!=='jp') onToggleLang?.(); setLangOpen(false); }}>
                      <span className="cp-lang-badge">JP</span>{t.japanese}
                      {lang==='jp' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft:'auto' }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  </div>
                )}
                <button className="cp-lang-btn" onClick={() => setLangOpen(o => !o)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>{lang==='en' ? t.english : t.japanese}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft:'auto', transform: langOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <div className="cp-version">v1.2.0</div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="fd-main" style={{ display:'flex', flexDirection:'column', alignItems:'stretch', padding:0 }}>

        {/* Header */}
        <div className="mg-header" style={{ borderBottom:'1px solid #f0f1f5' }}>
          <button className="mg-back-btn" onClick={onBack}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="mg-title">Add Files</span>
        </div>

        {/* Two-panel body */}
        <div style={{ display:'flex', flex:1, gap:20, overflow:'hidden', padding:'20px 24px' }}>

          {/* Left panel */}
          <div className="af-left-panel">

            {/* Folder List */}
            <div className="af-section">
              <div className="af-section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Folder List
              </div>
              <div style={{ position:'relative' }}>
                <button className="af-folder-trigger" onClick={() => setFolderDropOpen(o => !o)}>
                  <span style={{ color: selectedFolderPath ? '#3a3f5c' : '#b0b8cc', fontSize:13 }}>
                    {selectedFolderPath || 'Select folder...'}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink:0, transform: folderDropOpen?'rotate(180deg)':'none', transition:'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {folderDropOpen && (
                  <div className="af-folder-menu">
                    <div className="np-folder-search-wrap" style={{ padding:'8px 10px 4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input className="np-folder-search" placeholder="Search folders..." value={folderSearch} onChange={e => setFolderSearch(e.target.value)} autoFocus />
                    </div>
                    {filteredFolders.map((f, i) => (
                      <button key={i} className="af-folder-option" onClick={() => selectFolder(f)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <span>{lang==='en' ? f.en : (f.jp || f.en)}</span>
                      </button>
                    ))}
                    {filteredFolders.length === 0 && <div style={{ padding:'8px 12px', fontSize:12, color:'#9098a9' }}>No folders found</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Files */}
            <div className="af-section">
              <div className="af-section-label">Upload Files</div>
              <div
                className={`af-dropzone${dragOver ? ' af-dropzone--over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" style={{ display:'none' }} onChange={e => handleFiles(e.target.files)} />
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                {files.length > 0 ? (
                  <p className="af-drop-main">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                ) : (
                  <>
                    <p className="af-drop-main">Drag &amp; drop files here</p>
                    <p className="af-drop-sub">PNG, JPG, GIF, WebP</p>
                    <p className="af-drop-or">or</p>
                  </>
                )}
                <button className="af-browse-btn" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse files</button>
              </div>
            </div>

            {/* Upload button — outside cards */}
            <button className="af-upload-btn" onClick={handleUpload} disabled={!files.length}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              Upload
            </button>
          </div>

          {/* Right preview panel */}
          <div className="af-right-panel">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:8 }} />
            ) : (
              <span className="af-preview-hint">Upload files to preview</span>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
