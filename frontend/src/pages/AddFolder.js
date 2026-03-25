import { useState } from 'react';

export default function AddFolder({ lang, t, products, onBack, onSave }) {
  const [rows, setRows] = useState([{ productId: '', folderName: '' }]);

  function addRow() {
    setRows(prev => [...prev, { productId: '', folderName: '' }]);
  }

  function removeRow(index) {
    if (rows.length === 1) return; // keep at least one row
    setRows(prev => prev.filter((_, i) => i !== index));
  }

  function updateRow(index, field, value) {
    setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  }

  function handleSave() {
    const valid = rows.filter(r => r.folderName.trim() && r.productId);
    if (!valid.length) return;
    const entries = valid.map(r => ({
      folderName: r.folderName.trim(),
      product: products.find(p => p.id === r.productId) || null,
    }));
    onSave(entries);
  }

  return (
    <div className="add-folder-page">
      {/* Top row */}
      <div className="add-folder-toprow">
        <button className="add-folder-back-btn" onClick={onBack}>  {t.back}</button>
        <span className="add-folder-title">{t.addFolder}</span>
      </div>

      {/* Form card */}
      <div className="add-folder-card">
        <div className="add-folder-section-title">{t.basicInfo}</div>

        <div className="add-folder-inner">
          {/* Column headers */}
          <div className="add-folder-row-header">
            <span className="add-folder-col-label">
              {t.productNameLabel} <span className="add-folder-required">*</span>
            </span>
            <span className="add-folder-col-label">
              {t.folderNameLabel} <span className="add-folder-required">*</span>
            </span>
            <span className="add-folder-col-del" />
          </div>

          {/* Input rows */}
          {rows.map((row, i) => (
            <div key={i} className="add-folder-input-row">
              <div className="add-folder-input-wrap add-folder-col-product">
                <select
                  className="add-folder-select"
                  value={row.productId}
                  onChange={e => updateRow(i, 'productId', e.target.value)}
                >
                  <option value=""></option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {lang === 'en'
                        ? `${p.companyEn} > ${p.en}`
                        : `${p.companyJp} > ${p.jp}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="add-folder-input-wrap add-folder-col-name">
                <input
                  className="add-folder-input"
                  type="text"
                  value={row.folderName}
                  onChange={e => updateRow(i, 'folderName', e.target.value)}
                  placeholder={lang === 'en' ? 'Folder name' : 'フォルダ名'}
                />
              </div>

              <button
                className="add-folder-remove-btn"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
              >×</button>
            </div>
          ))}

          {/* Add row button */}
          <button className="add-folder-add-row-btn" onClick={addRow}>
            + {lang === 'en' ? 'Add Row' : '行を追加'}
          </button>
        </div>

        <button className="add-folder-save-btn" onClick={handleSave}>
          {t.save}
        </button>
      </div>
    </div>
  );
}
