import { useState } from 'react';
import translations from '../../translations';

const MATRIX_ITEMS = [
  { id: 1, title: 'Banner Copy',       subtitle: 'Write compelling banner copy for the product...', color: '#f59e0b', defaultPrompt: 'Write compelling banner copy for the product launch campaign targeting young professionals aged 25–35.' },
  { id: 2, title: 'Visual Direction',  subtitle: 'Describe the visual style, color palette, ...',   color: '#6366f1', defaultPrompt: 'Describe the visual style, color palette, and imagery direction for the campaign materials.' },
  { id: 3, title: 'Target Audience',   subtitle: 'Define the primary and secondary target...',       color: '#10b981', defaultPrompt: 'Define the primary and secondary target audiences for this campaign.' },
  { id: 4, title: 'Key Message',       subtitle: 'Craft the core brand message and value...',        color: '#f43f5e', defaultPrompt: 'Craft the core brand message and value proposition for the campaign.' },
];

const REPLIES = {
  1: 'Elevate Your Every Day — where innovation meets simplicity. Discover the product that professionals trust to get more done, faster. Limited launch pricing available now.',
  2: 'Clean, modern aesthetic with a bold indigo and white palette. Use high-contrast photography showing professionals in motion. Typography: geometric sans-serif with strong hierarchy.',
  3: 'Primary: urban professionals aged 25–35 with disposable income and a drive for productivity. Secondary: small business owners and freelancers seeking reliable solutions.',
  4: 'Empowering every ambition — our product removes friction so you can focus on what matters most. Built for those who refuse to settle.',
};

export default function MatrixGenerationPage({ lang, user, onBack, onLogout, onToggleLang, onNavigate }) {
  const t = translations[lang];
  const [collapsed,    setCollapsed]    = useState(false);
  const [langOpen,     setLangOpen]     = useState(false);
  const [activeTab,    setActiveTab]    = useState('prompts');
  const [prompts,      setPrompts]      = useState(Object.fromEntries(MATRIX_ITEMS.map(i => [i.id, i.defaultPrompt])));
  const [outputs,      setOutputs]      = useState({});
  const [generating,   setGenerating]   = useState({});
  const [generatingAll,setGeneratingAll]= useState(false);

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const doneCount = Object.keys(outputs).length;

  function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function handleGenerate(id) {
    if (generating[id]) return;
    setGenerating(p => ({ ...p, [id]: true }));
    setTimeout(() => {
      setOutputs(p => ({ ...p, [id]: { text: REPLIES[id] || REPLIES[1], timestamp: getTimestamp(), model: 'OpenAI' } }));
      setGenerating(p => ({ ...p, [id]: false }));
      setActiveTab('logs');
    }, 800);
  }

  function handleGenerateAll() {
    if (generatingAll) return;
    const pending = MATRIX_ITEMS.filter(item => !outputs[item.id]);
    if (!pending.length) return;
    setGeneratingAll(true);
    pending.forEach((item, i) => {
      setGenerating(p => ({ ...p, [item.id]: true }));
      setTimeout(() => {
        setOutputs(p => ({ ...p, [item.id]: { text: REPLIES[item.id] || REPLIES[1], timestamp: getTimestamp(), model: 'OpenAI' } }));
        setGenerating(p => ({ ...p, [item.id]: false }));
        if (i === pending.length - 1) { setGeneratingAll(false); setActiveTab('logs'); }
      }, 800 + i * 500);
    });
  }

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
          <button className="cp-nav-item" title={t.newChat} onClick={() => onNavigate?.('newChat')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!collapsed && t.newChat}
          </button>
          <button className="cp-nav-item" title={t.notification} onClick={() => onNavigate?.('notification')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {!collapsed && t.notification}
          </button>
          <button className="cp-nav-item" title={t.companies} onClick={() => onNavigate?.('companies')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {!collapsed && t.companies}
          </button>
        </nav>

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
              <div className="cp-version">v1.0.0</div>
            </>
          )}
        </div>
      </aside>

      {/* ── Content ── */}
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

        {/* Tabs */}
        <div className="mg-tabs-bar">
          <button className={`mg-tab${activeTab === 'prompts' ? ' mg-tab--active' : ''}`} onClick={() => setActiveTab('prompts')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Prompts
          </button>
          <button className={`mg-tab${activeTab === 'logs' ? ' mg-tab--active' : ''}`} onClick={() => setActiveTab('logs')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Generation Logs
            {doneCount > 0 && <span className="mg-tab-badge">{doneCount}</span>}
          </button>
        </div>

        <div className="mg-body">

          {/* Left panel — content changes per tab */}
          <div className="mg-list-panel">
            {activeTab === 'prompts' || doneCount > 0 ? (
              <div className="mg-list">
                {activeTab === 'logs'
                  ? MATRIX_ITEMS.filter(item => outputs[item.id]).map(item => (
                    <button key={item.id} className="mg-log-item">
                      <div className="mg-list-check">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div className="mg-list-text">
                        <span className="mg-list-title">{item.title}</span>
                        <span className="mg-list-subtitle">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9098a9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {outputs[item.id].timestamp} · {outputs[item.id].model}
                        </span>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))
                  : MATRIX_ITEMS.map(item => (
                    <button key={item.id} className="mg-list-item">
                      <div className="mg-list-dot" style={{ background: item.color }} />
                      <div className="mg-list-text">
                        <span className="mg-list-title">{item.title}</span>
                        <span className="mg-list-subtitle">{item.subtitle}</span>
                      </div>
                      {outputs[item.id]
                        ? <span className="mg-list-done">Done</span>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                      }
                    </button>
                  ))
                }
              </div>
            ) : (
              <div className="mg-logs-empty-panel">
                <p>No logs yet. Generate a section to see logs here.</p>
              </div>
            )}
            <div className="mg-list-footer">
              <button className="mg-generate-all-btn" onClick={handleGenerateAll} disabled={generatingAll}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                {generatingAll ? 'Generating...' : 'Generate All'}
              </button>
            </div>
          </div>

          {/* Right cards panel — always visible */}
          <div className="mg-cards-panel">
            {MATRIX_ITEMS.map(item => (
              <div key={item.id} className="mg-card">
                <div className="mg-card-header">
                  <div className="mg-card-dot" style={{ background: outputs[item.id] ? '#22c55e' : item.color }} />
                  <span className="mg-card-title">{item.title}</span>
                  {outputs[item.id] && (
                    <span className="mg-card-done-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Done
                    </span>
                  )}
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
                <div className={`mg-card-output${outputs[item.id] ? ' mg-card-output--filled' : ''}`}>
                  {generating[item.id]
                    ? 'Generating…'
                    : (outputs[item.id]?.text || 'No output yet. Click Generate to create content for this section.')}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
