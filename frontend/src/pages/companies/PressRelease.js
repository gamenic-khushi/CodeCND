export default function PressRelease({
  lang, t,
  prRows, prSearch, setPrSearch, prSort, prCopied,
  onAddClick, onPrSort, onDeleteRow, onCopyRefId, onViewRow, onEditRow,
}) {
  const filteredPrRows = prRows
    .filter(r =>
      (lang === 'en' ? r.en : r.jp).toLowerCase().includes(prSearch.toLowerCase()) ||
      r.refId.toLowerCase().includes(prSearch.toLowerCase())
    )
    .sort((a, b) => {
      const dir = prSort.dir === 'asc' ? 1 : -1;
      const va = (prSort.col === 'title' ? (lang === 'en' ? a.en : a.jp) : a[prSort.col]) || '';
      const vb = (prSort.col === 'title' ? (lang === 'en' ? b.en : b.jp) : b[prSort.col]) || '';
      return va < vb ? -dir : va > vb ? dir : 0;
    });

  return (
    <div className="pr-container">
      {/* Toolbar */}
      <div className="pr-toolbar">
        <button className="cp-add-btn" onClick={onAddClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <div className="cp-search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0c4d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
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
          <div className="pr-th pr-col-id">{t.referenceId}</div>
          <div className="pr-th pr-col-date">{t.date}</div>
          <div className="pr-th pr-col-title">{t.prTitle}</div>
          <div className="pr-th pr-col-action" />
        </div>
        <div className="pr-tbody">
          {filteredPrRows.map(row => (
            <div key={row.id} className="pr-row">
              <div className="pr-cell pr-col-id pr-cell-id">
                <span className="pr-refid-text">{row.refId}</span>
                <button
                  className="pr-copy-btn"
                  onClick={() => onCopyRefId(row.id, row.refId)}
                  title="Copy reference ID"
                >
                  {prCopied === row.id ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="pr-cell pr-col-date pr-cell-date">{row.date}</div>
              <div className="pr-cell pr-col-title pr-cell-title">{lang === 'en' ? row.en : row.jp}</div>
              <div className="pr-cell pr-col-action pr-cell-action">
                <button className="cp-icon-btn cp-icon-btn--view" title="View" onClick={() => onViewRow?.(row)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button className="cp-icon-btn cp-icon-btn--edit" title="Edit" onClick={() => onEditRow?.(row)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </button>
                <button className="cp-icon-btn cp-icon-btn--delete" title="Delete" onClick={() => onDeleteRow(row.id)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {filteredPrRows.length === 0 && (
            <div className="pr-empty">No press releases found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
