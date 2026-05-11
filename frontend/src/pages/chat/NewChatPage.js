import { useState, useRef, useEffect } from 'react';
import translations from '../../translations';
import { CompanyIcon, ProductIcon, FolderIcon } from '../../icons';
import Sidebar from '../../components/Sidebar';
import './NewChatPage.css';
import '../../components/modals.css';

const OPENAI_KEY = process.env.REACT_APP_OPENAI_API_KEY;

async function openaiChat(messages, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: model === 'OpenAI' ? 'gpt-4o' : 'gpt-4o', max_tokens: 4096, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
  return data.choices[0].message.content;
}

async function openaiImage(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Image generation error');
  return data.data[0].url;
}

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
      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero"/>
      </svg>
    ),
  },
];

export default function NewChatPage({ lang, user, folders, companies, products = [], folderRows, fileRows, initialFolder, initialName, onBack, onLogout, onNavigate, onSave, onToggleLang, onMatrixGenerate, onCreateFolder }) {
  const t = translations[lang];

  // Chat form
  const [selectedFolder,    setSelectedFolder]    = useState('');
  const [selectedFolderPath,setSelectedFolderPath]= useState('');

  useEffect(() => {
    if (!initialFolder) return;
    const compName = lang === 'en' ? (initialFolder.companyEn || '') : (initialFolder.companyJp || initialFolder.companyEn || '');
    const prodName = lang === 'en' ? (initialFolder.productEn || '') : (initialFolder.productJp || initialFolder.productEn || '');
    const folName  = lang === 'en' ? (initialFolder.en || '') : (initialFolder.jp || initialFolder.en || '');
    setSelectedFolder(initialFolder._awid || initialFolder.id || '');
    setSelectedFolderPath([compName, prodName, folName].filter(Boolean).join(' > '));
  }, [initialFolder]); // eslint-disable-line react-hooks/exhaustive-deps
  const [chatName,          setChatName]           = useState(initialName || '');
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

  const recentFiles = (fileRows || []).filter(f => f.type === 'Chat').slice(0, 8);

  // Chat messages (right panel)
  const [chatMessages,  setChatMessages]  = useState([]);
  const [chatLoading,   setChatLoading]   = useState(false);
  const chatEndRef                        = useRef(null);

  // Sparkle generate output
  const [isGenerating,     setIsGenerating]     = useState(false);

  // Prompt / Generation Logs tab
  const [promptTab, setPromptTab] = useState('prompt');

  // Generate Log modal
  const [showGenLogModal, setShowGenLogModal] = useState(false);

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

  async function handleSparkleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setPromptTab('generationLogs');
    try {
      const url = await openaiImage(prompt.trim());
      setChatMessages(prev => [...prev,
        { role: 'user', content: prompt.trim() },
        { role: 'assistant', model, content: `__IMAGE__${url}` },
      ]);
    } catch (err) {
      setChatMessages(prev => [...prev,
        { role: 'user', content: prompt.trim() },
        { role: 'assistant', model, content: 'Error: ' + err.message },
      ]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const updated = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(updated);
    setChatInput('');
    setChatLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const reply = await openaiChat(updated.map(m => ({ role: m.role, content: m.content })), model);
      setChatMessages(prev => [...prev, { role: 'assistant', model, content: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', model, content: 'Error: ' + err.message }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || chatLoading) return;
    const updated = [...chatMessages, { role: 'user', content: prompt.trim() }];
    setChatMessages(updated);
    setChatLoading(true);
    setPromptTab('generationLogs');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const reply = await openaiChat(updated.map(m => ({ role: m.role, content: m.content })), model);
      setChatMessages(prev => [...prev, { role: 'assistant', model, content: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', model, content: 'Error: ' + err.message }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  function handleOpenGenLog() {
    setPromptTab('generationLogs');
  }

  const selectedModelObj = MODELS.find(m => m.id === model) || MODELS[0];

  // Derive unique companies that have folders
  const folderData = folders || [];
  const companyNames = [...new Set(folderData.map(f => f.companyEn || '').filter(Boolean))];
  const allCompanies = (companies || []).length > 0
    ? (companies || [])
    : companyNames.map(name => ({ en: name, jp: name }));

  // Products under selected drill company
  const drillProducts = drillCompany
    ? (products || []).filter(p =>
        (drillCompany._awid && p.companyId === drillCompany._awid) ||
        (drillCompany.id && p.companyId === drillCompany.id) ||
        (p.companyEn && p.companyEn.toLowerCase() === drillCompany.en?.toLowerCase())
      )
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

  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleSave() {
    if (!chatName.trim()) return;
    if (onSave) onSave({ selectedFolder, name: chatName.trim(), prompt, messages: chatMessages });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  return (
    <div className="ncp-layout">

      {/* ── Sidebar ── */}
      <Sidebar
        activePage="newChat"
        lang={lang}
        user={user}
        companies={companies}
        products={products}
        folderRows={folderRows}
        fileRows={fileRows}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onToggleLang={onToggleLang}
        onOpenFolder={() => onNavigate('folders')}
        onCreateFolder={onCreateFolder}
      />

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
                            <span className="ncp-drill-icon">
                              <CompanyIcon size={13} />
                            </span>
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
                            <span className="ncp-drill-icon">
                              <ProductIcon size={13} />
                            </span>
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
                            <span className="ncp-drill-icon">
                              <FolderIcon size={13} />
                            </span>
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
              <div className="ncp-prompt-tabs">
                <button
                  className={`ncp-prompt-tab${promptTab === 'prompt' ? ' ncp-prompt-tab--active' : ''}`}
                  onClick={() => setPromptTab('prompt')}
                >{t.prompt}</button>
                <button
                  className={`ncp-prompt-tab${promptTab === 'generationLogs' ? ' ncp-prompt-tab--active' : ''}`}
                  onClick={() => { setPromptTab('generationLogs'); handleOpenGenLog(); }}
                >{t.generateLog}</button>
              </div>
              {promptTab === 'prompt' ? (
                <textarea
                  className="ncp-prompt-textarea ncp-prompt-textarea--md"
                  placeholder=""
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              ) : (
                <div className="ncp-genlog-tab-body">
                  {chatMessages.length === 0 && !chatLoading ? (
                    <div className="ncp-genlog-empty">{t.noMessagesYet || 'No messages yet'}</div>
                  ) : (
                    <>
                      {chatMessages.map((m, i) => (
                        <div key={i} className="ncp-genlog-section">
                          <div className={`ncp-genlog-label ncp-genlog-label--${m.role}`}>
                            {m.role === 'user' ? 'YOU' : 'AI'}
                          </div>
                          {m.content.startsWith('__IMAGE__') ? (
                            <img src={m.content.replace('__IMAGE__', '')} alt="Generated" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 4 }} />
                          ) : (
                            <div className={`ncp-genlog-${m.role === 'user' ? 'user' : 'assistant'}-bubble`}>{m.content}</div>
                          )}
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="ncp-genlog-section">
                          <div className="ncp-genlog-label ncp-genlog-label--assistant">AI</div>
                          <div className="ncp-genlog-assistant-bubble ncp-genlog-assistant-bubble--loading">Generating…</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
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
                  {m.content.startsWith('__IMAGE__')
                    ? <img src={m.content.replace('__IMAGE__', '')} alt="Generated" className="ncp-msg-image" />
                    : <div className="ncp-msg-bubble">{m.content}</div>
                  }
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
              <button className="ncp-generate-btn" onClick={handleGenerate} disabled={chatLoading || !prompt.trim()}>{t.generate}</button>
              <button className="ncp-sparkle-btn" onClick={handleSparkleGenerate} title="Generate image from prompt" disabled={isGenerating || !prompt.trim()}>
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.88566 1.75878C6.91244 1.61541 6.98852 1.48592 7.10072 1.39273C7.21292 1.29955 7.35418 1.24854 7.50003 1.24854C7.64588 1.24854 7.78714 1.29955 7.89935 1.39273C8.01155 1.48592 8.08763 1.61541 8.11441 1.75878L8.77128 5.23253C8.81794 5.4795 8.93795 5.70667 9.11568 5.88439C9.2934 6.06211 9.52056 6.18213 9.76753 6.22878L13.2413 6.88566C13.3847 6.91244 13.5141 6.98852 13.6073 7.10072C13.7005 7.21292 13.7515 7.35418 13.7515 7.50003C13.7515 7.64588 13.7005 7.78714 13.6073 7.89935C13.5141 8.01155 13.3847 8.08763 13.2413 8.11441L9.76753 8.77128C9.52056 8.81794 9.2934 8.93795 9.11568 9.11568C8.93795 9.2934 8.81794 9.52056 8.77128 9.76753L8.11441 13.2413C8.08763 13.3847 8.01155 13.5141 7.89935 13.6073C7.78714 13.7005 7.64588 13.7515 7.50003 13.7515C7.35418 13.7515 7.21292 13.7005 7.10072 13.6073C6.98852 13.5141 6.91244 13.3847 6.88566 13.2413L6.22878 9.76753C6.18213 9.52056 6.06211 9.2934 5.88439 9.11568C5.70667 8.93795 5.4795 8.81794 5.23253 8.77128L1.75878 8.11441C1.61541 8.08763 1.48592 8.01155 1.39273 7.89935C1.29955 7.78714 1.24854 7.64588 1.24854 7.50003C1.24854 7.35418 1.29955 7.21292 1.39273 7.10072C1.48592 6.98852 1.61541 6.91244 1.75878 6.88566L5.23253 6.22878C5.4795 6.18213 5.70667 6.06211 5.88439 5.88439C6.06211 5.70667 6.18213 5.4795 6.22878 5.23253L6.88566 1.75878Z"/>
                  <path d="M12.5 1.25V3.75"/>
                  <path d="M13.75 2.5H11.25"/>
                  <path d="M2.5 13.75C3.19036 13.75 3.75 13.1904 3.75 12.5C3.75 11.8096 3.19036 11.25 2.5 11.25C1.80964 11.25 1.25 11.8096 1.25 12.5C1.25 13.1904 1.80964 13.75 2.5 13.75Z"/>
                </svg>
              </button>
            </div>

            {/* Matrix Generation + Save row */}
            <div className="ncp-bottom-row">
              <button className="ncp-matrix-btn" onClick={onMatrixGenerate}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Matrix Generation
              </button>
              <button className="ncp-save-btn" onClick={handleSave} disabled={!chatName.trim()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {saveSuccess ? 'Saved!' : t.save}
              </button>
            </div>


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
                      {'Generating…'}
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

    </div>
  );
}
