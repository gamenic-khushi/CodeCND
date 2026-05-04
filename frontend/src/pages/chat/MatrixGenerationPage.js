import { useState } from 'react';
import translations from '../../translations';

const API = 'http://localhost:5000/api';

const MATRIX_ITEMS = [
  { id: 1, title: 'Banner Copy',      subtitle: 'Write compelling banner copy for the ...', defaultPrompt: 'Write compelling banner copy for the product launch campaign targeting young professionals aged 25–35.' },
  { id: 2, title: 'Visual Direction', subtitle: 'Describe the visual style, color palette,...', defaultPrompt: 'Describe the visual style, color palette, and imagery direction for the campaign materials.' },
  { id: 3, title: 'Target Audience',  subtitle: 'Define the primary and secondary targ...',   defaultPrompt: 'Define the primary and secondary target audiences for this campaign.' },
  { id: 4, title: 'Key Message',      subtitle: 'Craft the core brand message and val...',    defaultPrompt: 'Craft the core brand message and value proposition for the campaign.' },
];

export default function MatrixGenerationPage({ lang, user, folderRows, companies, onBack, onLogout, onToggleLang, onNavigate }) {
  const t = translations[lang];

  // Sidebar
  const [collapsed,       setCollapsed]       = useState(false);
  const [langOpen,        setLangOpen]        = useState(false);
  const [productsOpen,    setProductsOpen]    = useState(false);
  const [foldersOpen,     setFoldersOpen]     = useState(false);
  const [pdCoSearch,      setPdCoSearch]      = useState('');
  const [fdCoSearch,      setFdCoSearch]      = useState('');
  const [recentOpen,      setRecentOpen]      = useState(true);
  const [folderSearch,    setFolderSearch]    = useState('');

  // Matrix
  const [checkedItems,   setCheckedItems]   = useState(new Set());
  const [prompts,        setPrompts]        = useState(Object.fromEntries(MATRIX_ITEMS.map(i => [i.id, i.defaultPrompt])));
  const [outputs,        setOutputs]        = useState({});
  const [generating,     setGenerating]     = useState({});
  const [generatingAll,  setGeneratingAll]  = useState(false);

  const displayName  = user?.name  || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const allChecked = checkedItems.size === MATRIX_ITEMS.length;

  function toggleCheck(id) {
    setCheckedItems(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    allChecked
      ? setCheckedItems(new Set())
      : setCheckedItems(new Set(MATRIX_ITEMS.map(i => i.id)));
  }

  async function handleGenerate(id) {
    if (generating[id]) return;
    setGenerating(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'OpenAI',
          messages: [{ role: 'user', content: prompts[id] }],
        }),
      });
      const data = await res.json();
      setOutputs(p => ({ ...p, [id]: data.reply || 'No response received.' }));
    } catch (err) {
      setOutputs(p => ({ ...p, [id]: 'Error: ' + (err.message || 'Failed to generate.') }));
    } finally {
      setGenerating(p => ({ ...p, [id]: false }));
    }
  }

  async function handleGenerateAll() {
    if (generatingAll) return;
    const pending = MATRIX_ITEMS.filter(item => !outputs[item.id]);
    if (!pending.length) return;
    setGeneratingAll(true);
    pending.forEach(item => setGenerating(p => ({ ...p, [item.id]: true })));
    await Promise.all(pending.map(async (item) => {
      try {
        const res = await fetch(`${API}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'OpenAI',
            messages: [{ role: 'user', content: prompts[item.id] }],
          }),
        });
        const data = await res.json();
        setOutputs(p => ({ ...p, [item.id]: data.reply || 'No response received.' }));
      } catch (err) {
        setOutputs(p => ({ ...p, [item.id]: 'Error: ' + (err.message || 'Failed to generate.') }));
      } finally {
        setGenerating(p => ({ ...p, [item.id]: false }));
      }
    }));
    setGeneratingAll(false);
  }

  const pdFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !pdCoSearch || name.toLowerCase().includes(pdCoSearch.toLowerCase());
  });
  const fdFilteredCompanies = (companies || []).filter(c => {
    const name = lang === 'en' ? c.en : (c.jp || c.en);
    return !fdCoSearch || name.toLowerCase().includes(fdCoSearch.toLowerCase());
  });
  const recentFolders = (folderRows || [])
    .filter(f => !folderSearch || (f.en || '').toLowerCase().includes(folderSearch.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="mg-layout">

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
                {pdFilteredCompanies.map(c => (
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate?.('companies')}>
                    <div className="np-pd-item-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {pdFilteredCompanies.length === 0 && <div className="np-pd-empty">{t.noCompanies || 'No companies found'}</div>}
              </div>
            </div>
          )}

          {/* Folders */}
          <button className="cp-nav-item cp-nav-item--expand" onClick={() => { if (!collapsed) { setFoldersOpen(o => !o); setFdCoSearch(''); } }}>
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
                  <button key={c.id} className="np-pd-item" onClick={() => onNavigate?.('folders')}>
                    <div className="np-pd-item-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                    <span className="np-pd-item-name">{lang === 'en' ? c.en : (c.jp || c.en)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {fdFilteredCompanies.length === 0 && <div className="np-pd-empty">{t.noCompanies || 'No companies found'}</div>}
              </div>
            </div>
          )}
        </nav>

        {/* Recent Folders */}
        {!collapsed && (
          <>
            <button className="np-section-label cp-section-label--btn" style={{ marginTop: 12 }} onClick={() => setRecentOpen(o => !o)}>
              {t.recentFolders}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginLeft: 'auto', transform: recentOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            {recentOpen && (
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

      {/* ── Main content ── */}
      <div className="mg-content">

        {/* Header */}
        <div className="mg-header">
          <button className="mg-back-btn" onClick={onBack}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="mg-title">Matrix Generation</span>
        </div>

        <div className="mg-body">

          {/* Left panel */}
          <div className="mg-list-panel">
            <div className="mg-list-header">
              <span className="mg-list-header-title">Chats</span>
              <button className="mg-select-all-btn" onClick={selectAll}>
                {allChecked ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="mg-list">
              {MATRIX_ITEMS.map(item => (
                <button key={item.id} className="mg-list-item" onClick={() => toggleCheck(item.id)}>
                  <div className={`mg-checkbox${checkedItems.has(item.id) ? ' mg-checkbox--checked' : ''}`}>
                    {checkedItems.has(item.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <div className="mg-list-text">
                    <span className="mg-list-title">{item.title}</span>
                    <span className="mg-list-subtitle">{item.subtitle}</span>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>

            <div className="mg-list-footer">
              <button className="mg-generate-all-btn" onClick={handleGenerateAll} disabled={generatingAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C11.4 6.8 10.2 8.6 6 9.5C10.2 10.4 11.4 12.2 12 17C12.6 12.2 13.8 10.4 18 9.5C13.8 8.6 12.6 6.8 12 2Z"/>
                  <path d="M5 2C4.7 4.2 4.1 5.1 2 5.5C4.1 5.9 4.7 6.8 5 9C5.3 6.8 5.9 5.9 8 5.5C5.9 5.1 5.3 4.2 5 2Z"/>
                </svg>
                {generatingAll ? 'Generating...' : 'Generate All'}
              </button>
            </div>
          </div>

          {/* Right cards panel */}
          <div className="mg-cards-panel">
            {MATRIX_ITEMS.map(item => (
              <div key={item.id} className="mg-card">
                <div className="mg-card-header">
                  <div className="mg-card-dot" />
                  <span className="mg-card-title">{item.title}</span>
                  <button className="mg-card-generate-btn" onClick={() => handleGenerate(item.id)} disabled={!!generating[item.id]}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    {generating[item.id] ? 'Generating...' : 'Generate'}
                  </button>
                </div>

                <div className="mg-card-section-label">PROMPT</div>
                <textarea
                  className="mg-card-prompt"
                  value={prompts[item.id]}
                  onChange={e => setPrompts(p => ({ ...p, [item.id]: e.target.value }))}
                />

                <div className="mg-card-section-label">OUTPUT</div>
                <div className={`mg-card-output${outputs[item.id] ? ' mg-card-output--filled' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {generating[item.id]
                    ? 'Generating…'
                    : (outputs[item.id] || 'No output yet. Click Generate to create content for this section.')}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
