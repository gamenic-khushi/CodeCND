import { useState, useRef, useEffect } from 'react';

export default function ProductList({
  lang, t,
  products, setProducts,
  companies,
  productSearch, setProductSearch,
  productFilter, setProductFilter,
  productChecked, setProductChecked,
  onAddClick,
  onSelectProduct, onViewDetails, onEditProduct, onLinkCopy, onDuplicate, onDeleteProduct,
}) {
  const [sort, setSort]           = useState({ col: 'id', dir: 'asc' });
  const [linkedId, setLinkedId]   = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // product | 'bulk' | null

  const headerCheckRef = useRef(null);

  // Filter
  const filtered = products.filter(p => {
    const matchSearch =
      (p.en || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.jp || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchFilter = !productFilter ||
      (lang === 'en' ? p.companyEn : p.companyJp) === productFilter;
    return matchSearch && matchFilter;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.col === 'id')      return (a.id || '').localeCompare(b.id || '') * dir;
    if (sort.col === 'product') {
      const na = (lang === 'en' ? a.en : a.jp) || '';
      const nb = (lang === 'en' ? b.en : b.jp) || '';
      return na.localeCompare(nb, undefined, { sensitivity: 'base' }) * dir;
    }
    if (sort.col === 'company') {
      const na = (lang === 'en' ? a.companyEn : a.companyJp) || '';
      const nb = (lang === 'en' ? b.companyEn : b.companyJp) || '';
      return na.localeCompare(nb, undefined, { sensitivity: 'base' }) * dir;
    }
    return 0;
  });

  function toggleSort(col) {
    setSort(prev => ({ col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' }));
  }

  // Checkbox
  const allChecked  = sorted.length > 0 && sorted.every(p => productChecked.has(p.id));
  const someChecked = sorted.some(p => productChecked.has(p.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckRef.current) headerCheckRef.current.indeterminate = someChecked;
  }, [someChecked]);

  function toggleAll() {
    if (allChecked) setProductChecked(new Set());
    else setProductChecked(new Set(sorted.map(p => p.id)));
  }

  function toggleCheck(id) {
    setProductChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Unique company names for filter dropdown
  const companyOptions = [...new Map(
    products.map(p => [p.companyId ?? 'none', { id: p.companyId, en: p.companyEn, jp: p.companyJp }])
  ).values()];

  // Sort arrow
  function SortArrow() {
    return (
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" style={{ marginLeft: '4px', flexShrink: 0 }}>
        <path d="M6 1L9 5H3L6 1Z" fill="#9098a9" />
        <path d="M6 15L3 11H9L6 15Z" fill="#9098a9" />
      </svg>
    );
  }

  // Modal
  const isBulk     = deleteModal === 'bulk';
  const modalLabel = deleteModal && !isBulk
    ? (lang === 'en' ? deleteModal.en : deleteModal.jp)
    : `${productChecked.size} ${lang === 'en' ? 'products' : '件の製品'}`;

  function confirmDelete() {
    if (isBulk) {
      onDeleteProduct(Array.from(productChecked));
      setProductChecked(new Set());
    } else {
      onDeleteProduct(deleteModal.id);
    }
    setDeleteModal(null);
  }

  return (
    <div className="page company-page">

      {/* Top row */}
      <div className="pl-toolbar">
        <div className="pl-toolbar-left">
          <button className="cl-add-btn" onClick={onAddClick}><span>+</span></button>
        </div>

        <div className="pl-toolbar-right">
          <select
            className="pl-filter"
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
          >
            <option value="">{lang === 'en' ? 'All Companies' : '全企業'}</option>
            {companyOptions.map(c => (
              <option key={c.id ?? 'none'} value={lang === 'en' ? c.en : c.jp}>
                {lang === 'en' ? c.en : c.jp}
              </option>
            ))}
          </select>

          <div className="cl-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cl-table-card">
        <div className="pl-thead">
          <div className="pl-th pl-th-check">
            <input type="checkbox" className="cl-checkbox" ref={headerCheckRef}
              checked={allChecked} onChange={toggleAll} />
          </div>
          <div className="pl-th pl-th-refid table-col-header" onClick={() => toggleSort('id')}>
            {lang === 'en' ? 'Reference ID' : '参照ID'}<SortArrow />
          </div>
          <div className="pl-th pl-th-product table-col-header" onClick={() => toggleSort('product')}>
            {t.productName}<SortArrow />
          </div>
          <div className="pl-th pl-th-company table-col-header" onClick={() => toggleSort('company')}>
            {t.companyNameCol}<SortArrow />
          </div>
          <div className="pl-th pl-th-actions" />
        </div>

        <div className="pl-tbody">
          {sorted.map(product => (
            <div key={product.id} className="pl-row">

              <div className="pl-cell pl-cell-check">
                <input type="checkbox" className="cl-checkbox"
                  checked={productChecked.has(product.id)}
                  onChange={() => toggleCheck(product.id)}
                  onClick={e => e.stopPropagation()} />
              </div>

              <div className="pl-cell pl-cell-refid">
                <span className="cl-refid-text">{product.id}</span>
                <button className="cl-icon-btn" title="Copy ID"
                  onClick={() => navigator.clipboard.writeText(product.id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>

              <div className="pl-cell pl-cell-product">
                {lang === 'en' ? product.en : product.jp}
              </div>

              <div className="pl-cell pl-cell-company">
                {lang === 'en' ? product.companyEn : product.companyJp}
              </div>

              <div className="action-icons pl-cell-actions">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#4dd9d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title="Link"
                  style={{
                    cursor: 'pointer',
                    border: linkedId === product.id ? '1.5px solid #1a1a2e' : '1.5px solid transparent',
                    borderRadius: '6px', padding: '4px', boxSizing: 'content-box',
                  }}
                  onClick={() => { onLinkCopy(product.en); setLinkedId(product.id); setTimeout(() => setLinkedId(null), 3000); }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{cursor:'pointer'}} onClick={() => onDuplicate(product)}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#4dd9d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title={t.productDetails} onClick={() => onViewDetails(product)} style={{cursor:'pointer'}}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title="Edit" style={{cursor:'pointer'}} onClick={() => onEditProduct(product)}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  title={t.delete} onClick={() => setDeleteModal(product)} style={{cursor:'pointer'}}>
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
      {productChecked.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-count">{productChecked.size}</span>
          <span className="bulk-selected-text">{t.selected}</span>
          <button className="bulk-cancel-btn" onClick={() => setProductChecked(new Set())}>{t.cancel}</button>
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
              <div className="modal-icon-inner"><span className="modal-exclaim">!</span></div>
            </div>
            <div className="modal-title">{t.deleteConfirmation}</div>
            <div className="modal-desc">
              {t.deleteMessage} <strong>{modalLabel}</strong>? {t.deleteWarning}
            </div>
            <div className="modal-btn-row">
              <button className="modal-btn-cancel" onClick={() => setDeleteModal(null)}>{t.cancel}</button>
              <button className="modal-btn-delete" onClick={confirmDelete}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
