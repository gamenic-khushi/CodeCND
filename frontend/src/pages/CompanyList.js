import { useState, useRef, useEffect } from 'react';

export default function CompanyList({
  lang, t,
  companies, setCompanies,
  search, setSearch,
  companySort, setCompanySort,
  companyChecked, setCompanyChecked,
  onAddClick, onSelectCompany, onViewDetails, onEditCompany, onLinkCopy, onDuplicate, onDeleteCompany,
}) {
  const [linkedId, setLinkedId]   = useState(null);
  const [tooltipId, setTooltipId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // company | 'bulk' | null

  const headerCheckRef = useRef(null);

  const filtered = companies.filter(c =>
    (c.en || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.jp || '').toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    const dir = companySort.dir === 'asc' ? 1 : -1;
    if (companySort.col === 'id') return (a.id || '').localeCompare(b.id || '') * dir;
    const na = (lang === 'en' ? a.en : a.jp) || '';
    const nb = (lang === 'en' ? b.en : b.jp) || '';
    return na.localeCompare(nb, undefined, { sensitivity: 'base' }) * dir;
  });

  const allChecked  = sortedFiltered.length > 0 && sortedFiltered.every(c => companyChecked.has(c.id));
  const someChecked = sortedFiltered.some(c => companyChecked.has(c.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckRef.current) headerCheckRef.current.indeterminate = someChecked;
  }, [someChecked]);

  function toggleAll() {
    if (allChecked) {
      setCompanyChecked(new Set());
    } else {
      setCompanyChecked(new Set(sortedFiltered.map(c => c.id)));
    }
  }

  function toggleSort(col) {
    setCompanySort(prev => ({ col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' }));
  }

  function SortArrow() {
    return (
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none"
        style={{ marginLeft: '4px', flexShrink: 0 }}>
        <path d="M6 1L9 5H3L6 1Z" fill="#9098a9" />
        <path d="M6 15L3 11H9L6 15Z" fill="#9098a9" />
      </svg>
    );
  }

  function toggleCheck(id) {
    setCompanyChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Modal helpers
  const isBulk     = deleteModal === 'bulk';
  const modalLabel = deleteModal && !isBulk
    ? (lang === 'en' ? deleteModal.en : deleteModal.jp)
    : `${companyChecked.size} ${lang === 'en' ? 'companies' : '件の会社'}`;

  function confirmDelete() {
    if (isBulk) {
      onDeleteCompany(Array.from(companyChecked));
      setCompanyChecked(new Set());
    } else {
      onDeleteCompany(deleteModal.id);
    }
    setDeleteModal(null);
  }

  return (
    <div className="page company-page">
      {/* Top row */}
      <div className="cl-toolbar">
        <div className="cl-toolbar-left">
          <button className="cl-add-btn" onClick={onAddClick}><span>+</span></button>
        </div>
        <div className="cl-toolbar-right">
          <div className="cl-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cl-table-card">
        <div className="cl-thead">
          <div className="cl-th cl-th-check">
            <input
              type="checkbox"
              className="cl-checkbox"
              ref={headerCheckRef}
              checked={allChecked}
              onChange={toggleAll}
            />
          </div>
          <div className="cl-th cl-th-refid table-col-header" onClick={() => toggleSort('id')}>
            {lang === 'en' ? 'Reference ID' : '参照ID'}<SortArrow />
          </div>
          <div className="cl-th cl-th-name table-col-header" onClick={() => toggleSort('name')}>
            {lang === 'en' ? 'Company Name' : '企業名'}<SortArrow />
          </div>
          <div className="cl-th cl-th-actions" />
        </div>

        <div className="cl-tbody">
          {sortedFiltered.map(company => (
            <div key={company.id} className="cl-row">
              <div className="cl-cell cl-cell-check">
                <input type="checkbox" className="cl-checkbox"
                  checked={companyChecked.has(company.id)}
                  onChange={() => toggleCheck(company.id)}
                  onClick={e => e.stopPropagation()} />
              </div>

              <div className="cl-cell cl-cell-refid">
                <span className="cl-refid-text">{company.id}</span>
                <button className="cl-icon-btn" title="Copy ID"
                  onClick={() => navigator.clipboard.writeText(company.id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>

              <div className="cl-cell cl-cell-name">
                {lang === 'en' ? company.en : company.jp}
              </div>

              <div className="action-icons">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#4dd9d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title="Link"
                  style={{
                    cursor: 'pointer',
                    border: linkedId === company.id ? '1.5px solid #1a1a2e' : '1.5px solid transparent',
                    borderRadius: '6px',
                    padding: '4px',
                    boxSizing: 'content-box',
                  }}
                  onClick={() => {
                    onLinkCopy(company.en);
                    setLinkedId(company.id);
                    setTimeout(() => setLinkedId(null), 3000);
                  }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span className="cl-icon-wrap"
                  onMouseEnter={() => setTooltipId(company.id)}
                  onMouseLeave={() => setTooltipId(null)}>
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{cursor:'pointer'}}
                    onClick={() => onDuplicate(company)}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {tooltipId === company.id && (
                    <span className="cl-tooltip">{t.duplicate}</span>
                  )}
                </span>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#4dd9d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title={t.companyDetails} onClick={() => onViewDetails(company)} style={{cursor:'pointer'}}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title="Edit" onClick={() => onEditCompany(company)} style={{cursor:'pointer'}}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title={t.delete} onClick={() => setDeleteModal(company)} style={{cursor:'pointer'}}>
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {companyChecked.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-count">{companyChecked.size}</span>
          <span className="bulk-selected-text">{t.selected}</span>
          <button className="bulk-cancel-btn" onClick={() => setCompanyChecked(new Set())}>
            {t.cancel}
          </button>
          <button className="bulk-delete-btn" onClick={() => setDeleteModal('bulk')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {t.delete}
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>

            <div className="modal-icon-wrap">
              <div className="modal-icon-inner">
                <span className="modal-exclaim">!</span>
              </div>
            </div>

            <div className="modal-title">{t.deleteConfirmation}</div>

            <div className="modal-desc">
              {t.deleteMessage}{' '}
              <strong>{modalLabel}</strong>
              {'? '}
              {t.deleteWarning}
            </div>

            <div className="modal-btn-row">
              <button className="modal-btn-cancel" onClick={() => setDeleteModal(null)}>
                {t.cancel}
              </button>
              <button className="modal-btn-delete" onClick={confirmDelete}>
                {t.delete}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
