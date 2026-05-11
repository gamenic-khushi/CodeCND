import { useState } from 'react';
import { getFormFields } from '../../data';
import translations from '../../translations';
import Sidebar from '../../components/Sidebar';
import './CompaniesPage.css';
import '../../components/modals.css';

export default function AddCompanyPage({
  lang, user, companies, folderRows, fileRows, products, prRows,
  onLogout, onNavigate, onSave, onToggleLang, onSavePR, onUpdatePR, onDeletePR, onCreateFolder,
}) {

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

  // Edit Press Release modal
  const [editPR,      setEditPR]      = useState(null);
  const [editTitle,   setEditTitle]   = useState('');
  const [editDate,    setEditDate]    = useState('');

  // View Press Release modal
  const [viewPR,      setViewPR]      = useState(null);

  // Delete Press Release modal
  const [deletePR,    setDeletePR]    = useState(null);

  const t = translations[lang] || translations['en'];
  const formFields = getFormFields(t);

  const emptyForm = Object.fromEntries(formFields.map(f => [f.key, '']));
  const [formData, setFormData] = useState(emptyForm);

  function setField(key, val) { setFormData(prev => ({ ...prev, [key]: val })); }

  function handleSave() { if (onSave) onSave(formData); }

  return (
    <div className="cp-layout">

      {/* ── Sidebar ── */}
      <Sidebar
        activePage="companies"
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
                <button
                  className="acp-pr-register-btn"
                  onClick={() => {
                    if (onSavePR) onSavePR({ titleEn: prTitle, titleJp: prTitle, date: prDate, body: prBody, url: prUrl });
                    setPrTitle(''); setPrDate(''); setPrBody(''); setPrUrl('');
                    setShowAddPR(false);
                  }}
                >{t.register}</button>
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
              <div className="pr-container">
                {/* Toolbar */}
                <div className="pr-toolbar">
                  <button className="cp-add-btn" onClick={() => { setPrUrl(''); setPrTitle(''); setPrDate(''); setPrBody(''); setShowAddPR(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <div className="cp-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      className="cp-search-input"
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={prSearch}
                      onChange={e => setPrSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="cp-table-card">
                  <div className="pr-thead">
                    <div className="pr-th pr-col-id">{t.refIdCol}</div>
                    <div className="pr-th pr-col-date">{t.date}</div>
                    <div className="pr-th pr-col-title">{t.prTitle}</div>
                    <div className="pr-th pr-col-action" />
                  </div>
                  <div className="pr-tbody">
                    {(prRows || [])
                      .filter(r => {
                        const q = prSearch.toLowerCase();
                        return !q || (r.en || '').toLowerCase().includes(q) || (r.refId || '').toLowerCase().includes(q);
                      })
                      .map(r => (
                        <div key={r.id} className="pr-row">
                          <div className="pr-cell pr-col-id pr-cell-id">
                            <span className="pr-refid-text">{r.refId}</span>
                            <button className="pr-copy-btn" title="Copy Ref ID" onClick={() => { navigator.clipboard?.writeText(r.refId); }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                          </div>
                          <div className="pr-cell pr-col-date pr-cell-date">{r.date}</div>
                          <div className="pr-cell pr-col-title pr-cell-title">{lang === 'en' ? r.en : (r.jp || r.en)}</div>
                          <div className="pr-cell pr-col-action pr-cell-action">
                            <button className="cp-icon-btn cp-icon-btn--view" title="View" onClick={() => setViewPR(r)}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="cp-icon-btn cp-icon-btn--edit" title="Edit" onClick={() => { setEditPR(r); setEditTitle(lang === 'en' ? r.en : (r.jp || r.en)); setEditDate(r.date || ''); }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                            </button>
                            <button className="cp-icon-btn cp-icon-btn--delete" title="Delete" onClick={() => setDeletePR(r)}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    {(prRows || []).length === 0 && (
                      <div className="pr-empty">No press releases found.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        </>)}

      </main>

      {/* ── Delete Press Release Modal ── */}
      {deletePR && (
        <div className="del-backdrop" onClick={() => setDeletePR(null)}>
          <div className="del-modal" onClick={e => e.stopPropagation()}>
            <div className="del-modal-header">
              <div className="del-modal-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="del-modal-titles">
                <div className="del-modal-title">Delete</div>
                <div className="del-modal-subtitle">Confirm this action</div>
              </div>
              <button className="del-modal-close" onClick={() => setDeletePR(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="del-modal-body">
              <p className="del-modal-text">Are you sure you want to delete this item?</p>
              <p className="del-modal-warning">This action cannot be undone.</p>
            </div>
            <div className="del-modal-footer">
              <button className="del-modal-cancel" onClick={() => setDeletePR(null)}>Cancel</button>
              <button className="del-modal-confirm" onClick={() => {
                if (onDeletePR) onDeletePR(deletePR.id, deletePR._awid);
                setDeletePR(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Press Release Modal ── */}
      {viewPR && (
        <div className="ed-backdrop" onClick={() => setViewPR(null)}>
          <div className="ed-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="ed-modal-header">
              <span className="ed-modal-title">View Press Release</span>
              <button className="ed-modal-close" onClick={() => setViewPR(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="ed-modal-body" style={{ flex: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="ed-field">
                  <label className="ed-label">Ref ID</label>
                  <input className="ed-input" value={viewPR.refId} readOnly style={{ background: '#f5f6fa', color: '#9098a9' }} />
                </div>
                <div className="ed-field">
                  <label className="ed-label">Release Date</label>
                  <input className="ed-input" value={viewPR.date || ''} readOnly style={{ background: '#f5f6fa', color: '#9098a9' }} />
                </div>
              </div>
              <div className="ed-field">
                <label className="ed-label">Title</label>
                <input className="ed-input" value={lang === 'en' ? viewPR.en : (viewPR.jp || viewPR.en)} readOnly style={{ background: '#f5f6fa', color: '#9098a9' }} />
              </div>
              <div className="ed-modal-footer">
                <button className="ed-cancel" onClick={() => setViewPR(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Press Release Modal ── */}
      {editPR && (
        <div className="ed-backdrop" onClick={() => setEditPR(null)}>
          <div className="ed-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="ed-modal-header">
              <span className="ed-modal-title">Edit Press Release</span>
              <button className="ed-modal-close" onClick={() => setEditPR(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="ed-modal-body" style={{ flex: 'none' }}>
              <div className="ed-field">
                <label className="ed-label">Ref ID</label>
                <input className="ed-input" value={editPR.refId} readOnly style={{ background: '#f5f6fa', color: '#9098a9' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="ed-field">
                  <label className="ed-label">Release Date</label>
                  <input className="ed-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                </div>
                <div className="ed-field">
                  <label className="ed-label">Title</label>
                  <input className="ed-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
              </div>
              <div className="ed-modal-footer">
                <button className="ed-cancel" onClick={() => setEditPR(null)}>Cancel</button>
                <button className="ed-save" onClick={() => {
                  if (onUpdatePR) onUpdatePR({ ...editPR, en: editTitle, jp: editTitle, date: editDate });
                  setEditPR(null);
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
