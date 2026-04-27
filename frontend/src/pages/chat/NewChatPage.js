import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';

const MODELS = [
  {
    id: 'OpenAI',
    label: 'OpenAI',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#000' }}>
        <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 5.97 5.97 0 0 0-4.5-2A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.5a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .4-.68V11.7l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.58zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L3.97 13.9A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.82-3.36 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.41-.68zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.3 12.86 6.28 11.7a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.4.68zm1.1-2.37 2.6-1.5 2.6 1.5v3L11.6 15.5l-2.6-1.5z"/>
      </svg>
    ),
  },
  {
    id: 'Claude',
    label: 'Claude',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#d97559">
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(0 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(22.5 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(45 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(67.5 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(90 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(112.5 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(135 12 12)"/>
        <ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(157.5 12 12)"/>
      </svg>
    ),
  },
];

export default function NewChatPage({ lang, user, folders, companies, folderRows, fileRows, onBack, onLogout, onNavigate, onSave, onToggleLang, onMatrixGenerate }) {
  const t = translations[lang];
  // Sidebar
  const [collapsed,      setCollapsed]      = useState(false);
  const [productsOpen,   setProductsOpen]   = useState(false);
  const [foldersOpen,    setFoldersOpen]     = useState(false);
  const [folderSearch,    setFolderSearch]    = useState('');
  const [companySearch,   setCompanySearch]   = useState('');
  const [langOpen,        setLangOpen]        = useState(false);
  const [showNewFolder,   setShowNewFolder]   = useState(false);
  const [newFolderName,   setNewFolderName]   = useState('');
  const [newFolderProduct,setNewFolderProduct]= useState('');

  // Chat form
  const [selectedFolder,    setSelectedFolder]    = useState('');
  const [selectedFolderPath,setSelectedFolderPath]= useState('');
  const [chatName,          setChatName]           = useState('');
  const [prompt,            setPrompt]             = useState('');
  const [chatInput,         setChatInput]          = useState('');
  const [model,             setModel]              = useState('OpenAI');
  const [modelOpen,         setModelOpen]          = useState(false);
  const modelRef                                   = useRef(null);

  // + popup menu
  const [plusMenuOpen,      setPlusMenuOpen]      = useState(false);
  const [recentFilesOpen,   setRecentFilesOpen]   = useState(false);
  const plusMenuRef                               = useRef(null);
  const fileInputRef                              = useRef(null);

  const recentFiles = (fileRows || []).slice(0, 8);

  // Chat messages (right panel)
  const [chatMessages,  setChatMessages]  = useState([]);
  const [chatLoading,   setChatLoading]   = useState(false);
  const chatEndRef                        = useRef(null);

  // Sparkle generate output
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating,     setIsGenerating]     = useState(false);

  // Generate Log modal
  const [showGenLogModal, setShowGenLogModal] = useState(false);
  const [genLogLoading,   setGenLogLoading]   = useState(false);
  const [genLogReply,     setGenLogReply]     = useState('');

  // Folder drill-down dropdown
  const [folderDropOpen,  setFolderDropOpen]  = useState(false);
  const [drillLevel,      setDrillLevel]      = useState(0); // 0=company, 1=product, 2=folder
  const [drillCompany,    setDrillCompany]    = useState(null); // { en, jp }
  const [drillProduct,    setDrillProduct]    = useState(null); // { en, jp }
  const [drillSearch,     setDrillSearch]     = useState('');
  const folderDropRef                         = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (modelRef.current && !modelRef.current.contains(e.target)) setModelOpen(false);
      if (folderDropRef.current && !folderDropRef.current.contains(e.target)) setFolderDropOpen(false);
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) setPlusMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSparkleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedContent('');
    setTimeout(() => {
      setGeneratedContent(FIXED_REPLY);
      setIsGenerating(false);
    }, 800);
  }

  const FIXED_REPLY = 'Understood. Let me check on your question. Please wait a moment.';

  function handleChatSend() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    setChatLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', model, content: FIXED_REPLY }]);
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 800);
  }

  function handleGenerate() {
    const text = 'Generate a proposal based on the provided materials.';
    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', model, content: FIXED_REPLY }]);
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 800);
  }

  function handleOpenGenLog() {
    setShowGenLogModal(true);
    if (!prompt.trim()) return;
    setGenLogLoading(true);
    setGenLogReply('');
    setTimeout(() => {
      setGenLogReply(FIXED_REPLY);
      setGenLogLoading(false);
    }, 800);
  }

  const selectedModelObj = MODELS.find(m => m.id === model) || MODELS[0];

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const recentFolders = (folderRows || [])
    .filter(f => (f.en || '').toLowerCase().includes(folderSearch.toLowerCase()))
    .slice(0, 10);

  const filteredCompanies = (companies || [])
    .filter(c => (lang === 'en' ? c.en : c.jp || c.en || '').toLowerCase().includes(companySearch.toLowerCase()));

  // Derive unique companies that have folders
  const folderData = folders || [];
  const companyNames = [...new Set(folderData.map(f => f.companyEn || '').filter(Boolean))];
  const allCompanies = (companies || []).length > 0
    ? (companies || []).filter(c => companyNames.includes(c.en) || folderData.some(f => f.companyEn === c.en))
    : companyNames.map(name => ({ en: name, jp: name }));

  // Products under selected drill company
  const drillProducts = drillCompany
    ? [...new Set(folderData.filter(f => f.companyEn === drillCompany.en && (f.productEn || '')).map(f => f.productEn))]
        .map(pEn => ({ en: pEn, jp: folderData.find(f => f.productEn === pEn)?.productJp || pEn }))
    : [];

  // Folders under selected drill company + product
  const drillFolders = drillCompany && drillProduct
    ? folderData.filter(f => f.companyEn === drillCompany.en && f.productEn === drillProduct.en)
    : [];

  const drillSearchLow = drillSearch.toLowerCase();
  const visibleCompanies = allCompanies.filter(c => (lang === 'en' ? c.en : c.jp || c.en).toLowerCase().includes(drillSearchLow));
  const visibleProducts  = drillProducts.filter(p => (lang === 'en' ? p.en : p.jp || p.en).toLowerCase().includes(drillSearchLow));
  const visibleFolders   = drillFolders.filter(f => (lang === 'en' ? f.en : f.jp || f.en).toLowerCase().includes(drillSearchLow));

  function openFolderDrop() {
    setDrillLevel(0);
    setDrillCompany(null);
    setDrillProduct(null);
    setDrillSearch('');
    setFolderDropOpen(true);
  }

  function selectFolder(folder) {
    const compName = lang === 'en' ? drillCompany.en : (drillCompany.jp || drillCompany.en);
    const prodName = lang === 'en' ? drillProduct.en : (drillProduct.jp || drillProduct.en);
    const folName  = lang === 'en' ? folder.en : (folder.jp || folder.en);
    setSelectedFolder(folder._awid || folder.id);
    setSelectedFolderPath(`${compName} > ${prodName} > ${folName}`);
    setFolderDropOpen(false);
  }

  function handleSave() {
    if (onSave) onSave({ selectedFolder, name: chatName, prompt });
  }

  return (
    <div className="ncp-layout">

      {/* ── Sidebar ── */}
      <aside className={`ncp-sidebar${collapsed ? ' ncp-sidebar--collapsed' : ''}`}>

        {/* Header */}
        <div className="ncp-sidebar-header">
          {!collapsed && <span className="ncp-sidebar-brand">ChatCND</span>}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setCollapsed(c => !c)}>
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </div>

        {!collapsed && <div className="ncp-section-label">{t.menu}</div>}

        <nav className="ncp-nav">

          {/* New chat — ACTIVE */}
          <button className="ncp-nav-item ncp-nav-item--active" title={t.newChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!collapsed && t.newChat}
          </button>

          {/* New Folder */}
          <button className="ncp-nav-item" title={t.newFolder} onClick={() => setShowNewFolder(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {!collapsed && t.newFolder}
          </button>

          {/* Notification */}
          <button className="ncp-nav-item" title={t.notification} onClick={() => onNavigate('notification')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!collapsed && t.notification}
          </button>

          {/* Companies */}
          <button className="ncp-nav-item" title={t.companies} onClick={() => onNavigate('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {!collapsed && t.companies}
          </button>

          {/* Products — expandable with company list */}
          <button className="ncp-nav-item ncp-nav-item--expand" title={t.products} onClick={() => !collapsed && setProductsOpen(o => !o)}>
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
            <div className="ncp-company-panel">
              <div className="ncp-company-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="ncp-company-search"
                  type="text"
                  placeholder={t.searchCompany}
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                />
              </div>
              <div className="ncp-section-label" style={{ padding: '8px 16px 4px' }}>{t.company2}</div>
              <div className="ncp-company-list">
                {filteredCompanies.map((c, i) => (
                  <button key={i} className="ncp-company-item" onClick={() => onNavigate('companies')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
                    </svg>
                    <span>{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          <button className="ncp-nav-item ncp-nav-item--expand" title={t.folders} onClick={() => !collapsed && setFoldersOpen(o => !o)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {!collapsed && t.folders}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: foldersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>

        </nav>

        {/* Recent Folders */}
        {!collapsed && (
          <>
            <div className="ncp-section-label" style={{ marginTop: '12px' }}>
              {t.recentFolders}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div className="ncp-folder-search-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ncp-folder-search"
                type="text"
                placeholder={t.searchFolders}
                value={folderSearch}
                onChange={e => setFolderSearch(e.target.value)}
              />
            </div>
            <div className="ncp-folder-list">
              {recentFolders.map((f, i) => (
                <button key={i} className="ncp-folder-item" onClick={() => onNavigate('folders')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  {lang === 'en' ? f.en : f.jp}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="ncp-sidebar-footer">
          {collapsed ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <div className="ncp-user-avatar">{displayName[0]?.toUpperCase()}</div>
            </>
          ) : (
            <>
              <div className="ncp-user-row">
                <div className="ncp-user-avatar">{displayName[0]?.toUpperCase()}</div>
                <div className="ncp-user-info">
                  <div className="ncp-user-name">{displayName}</div>
                  <div className="ncp-user-email">{displayEmail}</div>
                </div>
                <button className="ncp-logout-btn" onClick={onLogout} title="Logout">
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
                      {t.english}
                      {lang === 'en' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <button className={`cp-lang-option${lang === 'jp' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'jp') onToggleLang?.(); setLangOpen(false); }}>
                      {t.japanese}
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
              <div className="ncp-version">v1.0.0</div>
            </>
          )}
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="ncp-main">

        {/* Header */}
        <div className="ncp-main-header">
          <button className="ncp-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Chat
          </button>
        </div>

        {/* Two-panel body */}
        <div className="ncp-body">

          {/* LEFT PANEL */}
          <div className="ncp-left-panel">

            <div className="ncp-field">
              <label className="ncp-field-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {t.folderList}
              </label>
              <div className="ncp-folder-drop" ref={folderDropRef}>
                <button className="ncp-folder-drop-trigger" onClick={folderDropOpen ? () => setFolderDropOpen(false) : openFolderDrop}>
                  <span className={selectedFolderPath ? 'ncp-folder-drop-value' : 'ncp-folder-drop-placeholder'}>
                    {selectedFolderPath || t.selectFolder}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: folderDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {folderDropOpen && (
                  <div className="ncp-folder-drop-menu">
                    {/* Breadcrumb back nav */}
                    {drillLevel > 0 && (
                      <button className="ncp-drill-back" onClick={() => { setDrillSearch(''); if (drillLevel === 2) { setDrillLevel(1); setDrillProduct(null); } else { setDrillLevel(0); setDrillCompany(null); } }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        {drillLevel === 1 ? 'Companies' : (lang === 'en' ? drillCompany?.en : drillCompany?.jp || drillCompany?.en)}
                      </button>
                    )}

                    {/* Search */}
                    <div className="ncp-drill-search-wrap">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        className="ncp-drill-search"
                        placeholder={drillLevel === 0 ? t.searchCompany : drillLevel === 1 ? t.searchProduct : t.searchFolder}
                        value={drillSearch}
                        onChange={e => setDrillSearch(e.target.value)}
                        autoFocus
                      />
                    </div>

                    {/* Level 0: Companies */}
                    {drillLevel === 0 && (
                      <>
                        <div className="ncp-drill-section-label">{t.company2}</div>
                        {visibleCompanies.length === 0 && <div className="ncp-drill-empty">{t.noCompanies}</div>}
                        {visibleCompanies.map((c, i) => (
                          <button key={i} className="ncp-drill-item" onClick={() => { setDrillCompany(c); setDrillLevel(1); setDrillSearch(''); }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            <span>{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Level 1: Products */}
                    {drillLevel === 1 && (
                      <>
                        <div className="ncp-drill-section-label">{t.product2}</div>
                        {visibleProducts.length === 0 && <div className="ncp-drill-empty">{t.noProducts}</div>}
                        {visibleProducts.map((p, i) => (
                          <button key={i} className="ncp-drill-item" onClick={() => { setDrillProduct(p); setDrillLevel(2); setDrillSearch(''); }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            <span>{lang === 'en' ? p.en : (p.jp || p.en)}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Level 2: Folders */}
                    {drillLevel === 2 && (
                      <>
                        <div className="ncp-drill-section-label">{t.folder2}</div>
                        {visibleFolders.length === 0 && <div className="ncp-drill-empty">{t.noFolders}</div>}
                        {visibleFolders.map((f, i) => (
                          <button key={i} className="ncp-drill-item" onClick={() => selectFolder(f)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>{lang === 'en' ? f.en : (f.jp || f.en)}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="ncp-field">
              <label className="ncp-field-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {t.name}
              </label>
              <input
                className="ncp-input"
                placeholder="Enter chat name..."
                value={chatName}
                onChange={e => setChatName(e.target.value)}
              />
            </div>

            <div className="ncp-field ncp-field--grow">
              <div className="ncp-prompt-header">
                <label className="ncp-field-label">{t.prompt}</label>
                <button className="ncp-generate-log-btn" onClick={handleOpenGenLog}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {t.generateLog}
                </button>
              </div>
              <textarea
                className="ncp-prompt-textarea ncp-prompt-textarea--md"
                placeholder=""
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="ncp-right-panel">

            {/* Chat messages */}
            <div className="ncp-content-area">
              {chatMessages.length === 0 && !chatLoading && null}
              {chatMessages.map((m, i) => (
                <div key={i} className={`ncp-msg ncp-msg--${m.role}`}>
                  {m.role === 'assistant' && (
                    <div className="ncp-msg-avatar">
                      {m.model === 'OpenAI'
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#000' }}><path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 5.97 5.97 0 0 0-4.5-2A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.5a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .4-.68V11.7l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.58zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L3.97 13.9A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.82-3.36 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.41-.68zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.3 12.86 6.28 11.7a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.4.68zm1.1-2.37 2.6-1.5 2.6 1.5v3L11.6 15.5l-2.6-1.5z"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="#d97559"><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(22.5 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(67.5 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(112.5 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(135 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(157.5 12 12)"/></svg>
                      }
                    </div>
                  )}
                  <div className="ncp-msg-bubble">{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="ncp-msg ncp-msg--assistant">
                  <div className="ncp-msg-avatar">
                    {model === 'OpenAI'
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#000' }}><path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 5.97 5.97 0 0 0-4.5-2A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.5a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .4-.68V11.7l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.58zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L3.97 13.9A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.82-3.36 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.41-.68zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.3 12.86 6.28 11.7a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.4.68zm1.1-2.37 2.6-1.5 2.6 1.5v3L11.6 15.5l-2.6-1.5z"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="#d97559"><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(22.5 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(67.5 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(112.5 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(135 12 12)"/><ellipse cx="12" cy="12" rx="1.3" ry="9.5" transform="rotate(157.5 12 12)"/></svg>
                    }
                  </div>
                  <div className="ncp-msg-bubble ncp-msg-bubble--loading">…</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="ncp-chat-section">
              <div className="ncp-chat-label">{t.chat}</div>
              <div className="ncp-chat-input-row">
                <div className="ncp-chat-plus-wrap" ref={plusMenuRef}>
                  {plusMenuOpen && (
                    <div className="ncp-plus-menu">
                      <input ref={fileInputRef} type="file" accept="image/*,*/*" style={{ display: 'none' }} />
                      <button className="ncp-plus-menu-item" onClick={() => { setPlusMenuOpen(false); fileInputRef.current?.click(); }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        {t.addImageFile}
                      </button>
                      <div className="ncp-plus-menu-item ncp-plus-menu-item--expand" onMouseEnter={() => setRecentFilesOpen(true)} onMouseLeave={() => setRecentFilesOpen(false)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        {t.recentFilesLabel}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="9 18 15 12 9 6"/></svg>

                        {recentFilesOpen && (
                          <div className="ncp-recent-files-panel">
                            <div className="ncp-recent-files-label">{t.recents}</div>
                            {recentFiles.length === 0 && <div className="ncp-recent-files-empty">{t.noRecentFiles}</div>}
                            {recentFiles.map((f, i) => (
                              <div key={i} className="ncp-recent-file-item">
                                <div className="ncp-recent-file-thumb">
                                  {f.blobUrl
                                    ? <img src={f.blobUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  }
                                </div>
                                <div className="ncp-recent-file-info">
                                  <div className="ncp-recent-file-name">{lang === 'en' ? f.en : (f.jp || f.en)}</div>
                                  <div className="ncp-recent-file-meta">{f.refId}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <button className="ncp-chat-plus" onClick={() => setPlusMenuOpen(o => !o)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                <input
                  className="ncp-chat-input"
                  placeholder={t.enterMessage}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                />
                <button className="ncp-chat-send" onClick={handleChatSend}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="ncp-action-bar">
              {/* Custom model dropdown */}
              <div className="ncp-model-dropdown" ref={modelRef}>
                {modelOpen && (
                  <div className="ncp-model-menu">
                    {MODELS.map(m => (
                      <button key={m.id} className={`ncp-model-option${m.id === model ? ' ncp-model-option--selected' : ''}`}
                        onClick={() => { setModel(m.id); setModelOpen(false); }}>
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button className="ncp-model-trigger" onClick={() => setModelOpen(o => !o)}>
                  {selectedModelObj.icon}
                  <span>{selectedModelObj.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: modelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
              <button className="ncp-generate-btn" onClick={handleGenerate} disabled={chatLoading}>{t.generate}</button>
              <button className="ncp-sparkle-btn" onClick={handleSparkleGenerate} title="Generate from prompt" disabled={isGenerating}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2 C11.4 6.8 10.2 8.6 6 9.5 C10.2 10.4 11.4 12.2 12 17 C12.6 12.2 13.8 10.4 18 9.5 C13.8 8.6 12.6 6.8 12 2Z"/>
                  <path d="M5 2 C4.7 4.2 4.1 5.1 2 5.5 C4.1 5.9 4.7 6.8 5 9 C5.3 6.8 5.9 5.9 8 5.5 C5.9 5.1 5.3 4.2 5 2Z"/>
                  <path d="M5 15 C4.7 17.2 4.1 18.1 2 18.5 C4.1 18.9 4.7 19.8 5 22 C5.3 19.8 5.9 18.9 8 18.5 C5.9 18.1 5.3 17.2 5 15Z"/>
                </svg>
              </button>
            </div>

            {/* Matrix Generation row */}
            <div className="ncp-matrix-row">
              <button className="ncp-matrix-btn" onClick={onMatrixGenerate}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Matrix Generation
              </button>
            </div>

            {/* Save row */}
            <div className="ncp-save-row">
              <button className="ncp-save-btn" onClick={handleSave}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {t.save}
              </button>
            </div>

            {/* Generated output */}
            {(isGenerating || generatedContent) && (
              <div className="ncp-generated-output">
                {isGenerating
                  ? <div className="ncp-generated-loading">Generating…</div>
                  : <pre className="ncp-generated-pre">{generatedContent}</pre>
                }
              </div>
            )}

          </div>
        </div>

      </main>

      {/* ── Generate Log Modal ── */}
      {showGenLogModal && (
        <div className="np-modal-backdrop" onClick={() => setShowGenLogModal(false)}>
          <div className="np-modal ncp-genlog-modal" onClick={e => e.stopPropagation()}>
            <div className="np-modal-header">
              <span className="np-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {t.generateLog}
              </span>
              <button className="np-modal-close" onClick={() => setShowGenLogModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="ncp-genlog-body">
              {!prompt.trim() ? (
                <div className="ncp-genlog-empty">{t.noMessagesYet}</div>
              ) : (
                <>
                  <div className="ncp-genlog-section">
                    <div className="ncp-genlog-label">{t.you}</div>
                    <div className="ncp-genlog-user-bubble">{prompt}</div>
                  </div>
                  <div className="ncp-genlog-section">
                    <div className="ncp-genlog-label">{t.assistantLabel}</div>
                    <div className="ncp-genlog-assistant-bubble">
                      {genLogLoading ? 'Generating…' : genLogReply}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="np-modal-footer">
              <button className="np-modal-cancel" onClick={() => setShowGenLogModal(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Folder Modal ── */}
      {showNewFolder && (
        <div className="np-modal-backdrop" onClick={() => setShowNewFolder(false)}>
          <div className="np-modal" onClick={e => e.stopPropagation()}>
            <div className="np-modal-header">
              <span className="np-modal-title">{t.newFolder}</span>
              <button className="np-modal-close" onClick={() => setShowNewFolder(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="np-modal-body">
              <div className="np-modal-field">
                <label className="np-modal-label">{t.product}</label>
                <div className="np-modal-select-wrap">
                  <select className="np-modal-select" value={newFolderProduct} onChange={e => setNewFolderProduct(e.target.value)}>
                    <option value="">{t.selectProduct}</option>
                    {(folders || []).map((f, i) => (
                      <option key={i} value={f._awid || f.id}>{lang === 'en' ? f.en : (f.jp || f.en)}</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="np-modal-select-arrow"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div className="np-modal-field">
                <label className="np-modal-label">{t.folderName}</label>
                <input className="np-modal-input" placeholder="e.g. Spring Campaign 2026" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="np-modal-footer">
              <button className="np-modal-cancel" onClick={() => setShowNewFolder(false)}>{t.cancel}</button>
              <button className="np-modal-create" onClick={() => { setShowNewFolder(false); setNewFolderName(''); setNewFolderProduct(''); }}>{t.createFolder}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
