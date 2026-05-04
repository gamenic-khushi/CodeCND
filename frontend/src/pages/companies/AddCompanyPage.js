import { useState } from 'react';
import { getFormFields } from '../../data';
import translations from '../../translations';

export default function AddCompanyPage({
  lang, user, folderRows, products, prRows,
  onLogout, onNavigate, onSave, onToggleLang,
}) {
  // Sidebar
  const [collapsed,          setCollapsed]          = useState(false);
  const [productsOpen,       setProductsOpen]       = useState(false);
  const [foldersOpen,        setFoldersOpen]        = useState(false);
  const [recentFoldersOpen,  setRecentFoldersOpen]  = useState(false);
  const [recentFilesOpen,    setRecentFilesOpen]    = useState(false);
  const [langOpen,           setLangOpen]           = useState(false);
  const [showNewFolder,      setShowNewFolder]      = useState(false);
  const [newFolderName,      setNewFolderName]      = useState('');
  const [newFolderProduct,   setNewFolderProduct]   = useState('');

  // Form
  const [activeTab,   setActiveTab]   = useState(0);
  const [urlInput,    setUrlInput]    = useState('');
  const [prSearch,    setPrSearch]    = useState('');

  // Add Press Release sub-view
  const [showAddPR,   setShowAddPR]   = useState(false);
  const [prUrl,       setPrUrl]       = useState('');
  const [prTitle,     setPrTitle]     = useState('');
  const [prDate,      setPrDate]      = useState('');
  const [prBody,      setPrBody]      = useState('');

  const t = translations[lang] || translations['en'];
  const formFields = getFormFields(t);

  const emptyForm = Object.fromEntries(formFields.map(f => [f.key, '']));
  const [formData, setFormData] = useState(emptyForm);

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  function setField(key, val) { setFormData(prev => ({ ...prev, [key]: val })); }

  function handleSave() { if (onSave) onSave(formData); }

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

          <button className="cp-nav-item cp-nav-item--active" title={t.companies} onClick={() => onNavigate('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
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

          <button className="cp-nav-item cp-nav-item--expand" title={t.folders} onClick={() => !collapsed && setFoldersOpen(o => !o)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {!collapsed && t.folders}
            </span>
            {!collapsed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: foldersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>}
          </button>
        </nav>

        {!collapsed && <>
          <button className="cp-section-label cp-section-label--btn" style={{ marginTop: 12 }} onClick={() => setRecentFoldersOpen(o => !o)}>
            {t.recentFolders}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', transform: recentFoldersOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          {recentFoldersOpen && (
            <div className="cp-folder-list">
              {(folderRows || []).slice(0, 8).map((f, i) => (
                <button key={i} className="cp-folder-item" onClick={() => onNavigate('folders')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  {lang === 'en' ? f.en : f.jp}
                </button>
              ))}
            </div>
          )}

          <button className="cp-section-label cp-section-label--btn" onClick={() => setRecentFilesOpen(o => !o)}>
            {t.recentFiles}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', transform: recentFilesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>}

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
                    <button
                      className={`cp-lang-option${lang === 'en' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'en') onToggleLang?.(); setLangOpen(false); }}
                    >
                      <span className="cp-lang-badge">EN</span>{t.english}
                      {lang === 'en' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <button
                      className={`cp-lang-option${lang === 'jp' ? ' cp-lang-option--active' : ''}`}
                      onClick={() => { if (lang !== 'jp') onToggleLang?.(); setLangOpen(false); }}
                    >
                      <span className="cp-lang-badge">JP</span>{t.japanese}
                      {lang === 'jp' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
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
      <main className="acp-main">

        {/* ── Add Press Release Sub-view ── */}
        {showAddPR ? (<>
          <div className="acp-header">
            <div className="acp-breadcrumb">
              <button className="acp-breadcrumb-icon-btn" onClick={() => onNavigate('companies')} title="Companies">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                </svg>
              </button>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="acp-breadcrumb-page">{t.addPressRelease}</span>
            </div>
          </div>

          <div className="acp-scroll">
            <div className="acp-content">

              {/* URL card */}
              <div className="acp-card">
                <div className="acp-card-title">{t.prUrlLabel}</div>
                <div className="acp-url-row">
                  <input className="acp-url-input" type="text" value={prUrl} onChange={e => setPrUrl(e.target.value)} />
                  <button className="acp-analyze-btn">{t.analyze}</button>
                </div>
              </div>

              {/* Details card */}
              <div className="acp-card">
                <div className="acp-card-title acp-card-title--blue">{t.prDetails}</div>
                <div className="acp-card-subtitle">{t.prDetailsSubtitle}</div>

                <div className="acp-pr-detail-grid">
                  <div className="acp-field acp-field--pr-title">
                    <label className="acp-label">{t.title}</label>
                    <input className="acp-input" type="text" value={prTitle} onChange={e => setPrTitle(e.target.value)} />
                  </div>
                  <div className="acp-field acp-field--pr-date">
                    <label className="acp-label">{t.releaseDate}</label>
                    <input className="acp-input" type="date" value={prDate} onChange={e => setPrDate(e.target.value)} />
                  </div>
                  <div className="acp-field acp-field--full">
                    <label className="acp-label">{t.bodyText}</label>
                    <textarea className="acp-textarea acp-textarea--body" value={prBody} onChange={e => setPrBody(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="acp-pr-form-footer">
                <button className="acp-pr-back-btn" onClick={() => setShowAddPR(false)}>{t.backBtn}</button>
                <button className="acp-pr-register-btn" onClick={() => setShowAddPR(false)}>{t.register}</button>
              </div>

            </div>
          </div>
        </>) : (<>

        {/* Header */}
        <div className="acp-header">
          <div className="acp-breadcrumb">
            <button className="acp-breadcrumb-icon-btn" onClick={() => onNavigate('companies')} title="Companies">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
              </svg>
            </button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="acp-breadcrumb-page">{t.addCompany}</span>
          </div>
          <div className="acp-tabs">
            <div className="acp-tabs-slider" style={{ transform: activeTab === 1 ? 'translateX(100%)' : 'none' }} />
            <button className={`acp-tab${activeTab === 0 ? ' acp-tab--active' : ''}`} onClick={() => setActiveTab(0)}>
              {t.salesInformation}
            </button>
            <button className={`acp-tab${activeTab === 1 ? ' acp-tab--active' : ''}`} onClick={() => setActiveTab(1)}>
              {t.pressRelease}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="acp-scroll">
          {activeTab === 0 && (
            <div className="acp-content">

              {/* Analyze URL card */}
              <div className="acp-card">
                <div className="acp-card-title">{t.analyzeCompanyUrl}</div>
                <div className="acp-url-row">
                  <input
                    className="acp-url-input"
                    type="text"
                    placeholder={t.pleaseEnterUrl}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                  />
                  <button className="acp-analyze-btn">{t.analyze}</button>
                </div>
              </div>

              {/* Company Profile card */}
              <div className="acp-card">
                <div className="acp-card-title acp-card-title--blue">{t.companyProfile}</div>
                <div className="acp-card-subtitle">{t.companyProfileSubtitle}</div>

                <div className="acp-form-grid">

                  {/* Row 1: Company Name | Company Website */}
                  {['companyName', 'companyWebsite'].map(key => {
                    const f = formFields.find(x => x.key === key);
                    return f ? (
                      <div className="acp-field" key={key}>
                        <label className="acp-label">{f.label}{f.required && <span className="acp-required"> *</span>}</label>
                        <input className="acp-input" type="text" value={formData[key] || ''} onChange={e => setField(key, e.target.value)} />
                      </div>
                    ) : null;
                  })}

                  {/* Row 2: Industry | Employees */}
                  {['industry', 'employees'].map(key => {
                    const f = formFields.find(x => x.key === key);
                    return f ? (
                      <div className="acp-field" key={key}>
                        <label className="acp-label">{f.label}</label>
                        <input className="acp-input" type="text" value={formData[key] || ''} onChange={e => setField(key, e.target.value)} />
                      </div>
                    ) : null;
                  })}

                  {/* Row 3: Revenue Scale (left only) */}
                  {(() => {
                    const f = formFields.find(x => x.key === 'revenueScale');
                    return f ? (
                      <div className="acp-field" key="revenueScale">
                        <label className="acp-label">{f.label}</label>
                        <input className="acp-input" type="text" value={formData.revenueScale || ''} onChange={e => setField('revenueScale', e.target.value)} />
                      </div>
                    ) : null;
                  })()}
                  <div className="acp-field" />

                  {/* Full-width fields from Brand Concept onwards */}
                  {['brandConcept','companyCategories','headquartersLocation','foundingDate',
                    'businessActivities','mainProducts','salesScale','marketShare',
                    'targetCustomer','competitors','missionVision','brandStrategy',
                    'promotionHistory','swot','valueProposition','futureStrategy'].map(key => {
                    const f = formFields.find(x => x.key === key);
                    return f ? (
                      <div className="acp-field acp-field--full" key={key}>
                        <label className="acp-label">{f.label}</label>
                        <textarea className="acp-textarea acp-textarea--short" value={formData[key] || ''} onChange={e => setField(key, e.target.value)} />
                      </div>
                    ) : null;
                  })}

                  {/* Notes — full-width tall textarea */}
                  {(() => {
                    const f = formFields.find(x => x.key === 'notes');
                    return f ? (
                      <div className="acp-field acp-field--full" key="notes">
                        <label className="acp-label">{f.label}</label>
                        <textarea className="acp-textarea" value={formData.notes || ''} onChange={e => setField('notes', e.target.value)} />
                      </div>
                    ) : null;
                  })()}

                </div>
              </div>

              {/* Actions */}
              <div className="acp-actions">
                <button className="acp-save-btn" onClick={handleSave}>{t.save}</button>
              </div>

            </div>
          )}

          {activeTab === 1 && (
            <div className="acp-content">
              <div className="acp-pr-card">
                <div className="acp-pr-toolbar">
                  <button className="acp-pr-add-btn" onClick={() => { setPrUrl(''); setPrTitle(''); setPrDate(''); setPrBody(''); setShowAddPR(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <div className="acp-pr-search-wrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      className="acp-pr-search"
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={prSearch}
                      onChange={e => setPrSearch(e.target.value)}
                    />
                  </div>
                </div>

              <div className="acp-pr-table-wrap">
                <table className="acp-pr-table">
                  <thead>
                    <tr>
                      <th className="acp-pr-th">{t.refIdCol}</th>
                      <th className="acp-pr-th">{t.date}</th>
                      <th className="acp-pr-th">{t.prTitle}</th>
                      <th className="acp-pr-th acp-pr-th--actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {(prRows || [])
                      .filter(r => {
                        const q = prSearch.toLowerCase();
                        return !q || (r.en || '').toLowerCase().includes(q) || (r.refId || '').toLowerCase().includes(q);
                      })
                      .map(r => (
                        <tr key={r.id} className="acp-pr-tr">
                          <td className="acp-pr-td acp-pr-td--ref">{r.refId}</td>
                          <td className="acp-pr-td">{r.date}</td>
                          <td className="acp-pr-td acp-pr-td--title">{lang === 'en' ? r.en : (r.jp || r.en)}</td>
                          <td className="acp-pr-td acp-pr-td--actions">
                            {/* View */}
                            <button className="acp-pr-action" title="View">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            {/* Edit */}
                            <button className="acp-pr-action" title="Edit">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                            </button>
                            {/* Delete */}
                            <button className="acp-pr-action" title="Delete">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              </div>{/* acp-pr-card */}
            </div>
          )}
        </div>

        </>)}

      </main>

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
                    {(products || []).map((p, i) => (
                      <option key={i} value={p._awid || p.id}>{lang === 'en' ? p.en : (p.jp || p.en)}</option>
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
