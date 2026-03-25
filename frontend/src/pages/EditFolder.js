import { useState } from 'react';

export default function EditFolder({ lang, t, folder, products, onBack, onUpdate }) {
  const initialProduct = products.find(p => p.en === folder?.productEn) || products[0] || null;

  const [selectedProductId, setSelectedProductId] = useState(initialProduct?.id || '');
  const [folderName, setFolderName] = useState(
    lang === 'en' ? (folder?.en || '') : (folder?.jp || '')
  );

  function handleSubmit() {
    const product = products.find(p => p.id === selectedProductId);
    onUpdate({
      en:        lang === 'en' ? folderName : folder.en,
      jp:        lang === 'jp' ? folderName : folder.jp,
      productEn: product ? product.en : folder.productEn,
      productJp: product ? product.jp : folder.productJp,
    });
  }

  return (
    <div className="page ec-page">

      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>{t.back}</button>
        <span className="ac-title">{t.editFolder}</span>
      </div>

      <div className="form-scroll">
        <div className="ec-container">
          <div className="cd-section-title">{t.basicInformation}</div>
          <div className="ec-fields-card">

            {/* Product Name */}
            <div className="ec-field-row">
              <label className="ec-field-label">{t.productName}</label>
              <select
                className="ec-field-input ec-field-select"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                <option value="">—</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {lang === 'en' ? p.en : p.jp}
                  </option>
                ))}
              </select>
            </div>

            {/* Folder Name */}
            <div className="ec-field-row">
              <label className="ec-field-label">{t.folderName}</label>
              <input
                className="ec-field-input"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
              />
            </div>

          </div>

          <button
            className="ec-update-btn"
            style={{ marginTop: '48px' }}
            onClick={handleSubmit}
          >
            {t.updateBtn}
          </button>
        </div>
      </div>

    </div>
  );
}
