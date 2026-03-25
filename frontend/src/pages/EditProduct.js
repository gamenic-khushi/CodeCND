import { useState } from 'react';

export default function EditProduct({ lang, t, product, companies, onBack, onUpdate }) {
  const [data, setData] = useState({
    companyId:          product.companyId          || '',
    productName:        lang === 'en' ? product.en : product.jp,
    websiteUrl:         product.websiteUrl          || '',
    industry:           product.industry            || '',
    employees:          product.employees           || '',
    revenueScale:       product.revenueScale        || '',
    brandConcept:       product.brandConcept        || '',
    releaseDate:        product.releaseDate         || '',
    price:              product.price               || '',
    targetCustomers:    product.targetCustomers     || '',
    usp:                product.usp                 || '',
    productSpecs:       product.productSpecs        || '',
    toneAndManner:      product.toneAndManner       || '',
    usageScenes:        product.usageScenes         || '',
    customerInsight:    product.customerInsight     || '',
    priceJustification: product.priceJustification  || '',
    salesMarketShare:   product.salesMarketShare    || '',
    costStructure:      product.costStructure       || '',
    pastPromotion:      product.pastPromotion       || '',
    salesChannels:      product.salesChannels       || '',
    swotAnalysis:       product.swotAnalysis        || '',
    futureOutlook:      product.futureOutlook       || '',
    notes:              product.notes               || '',
  });

  function set(key, val) { setData(prev => ({ ...prev, [key]: val })); }

  const textFields = [
    { key: 'websiteUrl',   label: t.websiteUrl,   type: 'text' },
    { key: 'industry',     label: t.industry,     type: 'text' },
    { key: 'employees',    label: t.employees,    type: 'text' },
    { key: 'revenueScale', label: t.revenueScale, type: 'text' },
    { key: 'brandConcept', label: t.brandConcept, type: 'text' },
    { key: 'releaseDate',  label: t.releaseDate,  type: 'date' },
    { key: 'price',        label: t.price,        type: 'text' },
  ];

  const textareaFields = [
    { key: 'targetCustomers',    label: t.targetCustomers },
    { key: 'usp',                label: t.usp },
    { key: 'productSpecs',       label: t.productSpecs },
    { key: 'toneAndManner',      label: t.toneAndManner },
    { key: 'usageScenes',        label: t.usageScenes },
    { key: 'customerInsight',    label: t.customerInsight },
    { key: 'priceJustification', label: t.priceJustification },
    { key: 'salesMarketShare',   label: t.salesMarketShare },
    { key: 'costStructure',      label: t.costStructure },
    { key: 'pastPromotion',      label: t.pastPromotion },
    { key: 'salesChannels',      label: t.salesChannels },
    { key: 'swotAnalysis',       label: t.swotAnalysis },
    { key: 'futureOutlook',      label: t.futureOutlook },
    { key: 'notes',              label: t.notes },
  ];

  return (
    <div className="page ec-page">

      {/* Header */}
      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>  {t.back}</button>
        <span className="ac-title">{t.editProduct}</span>
      </div>

      {/* Scrollable content */}
      <div className="form-scroll">
        <div className="ec-container">

          <div className="cd-section-title">{t.basicInformation}</div>

          <div className="ec-fields-card">

            {/* Company dropdown */}
            <div className="ec-field-row">
              <label className="ec-field-label">{t.company}</label>
              <select
                className="ec-field-input ec-field-select"
                value={data.companyId}
                onChange={e => set('companyId', e.target.value)}
              >
                <option value="">{t.noCompany}</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {lang === 'en' ? c.en : c.jp}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div className="ec-field-row">
              <label className="ec-field-label">{t.productName}</label>
              <input
                className="ec-field-input"
                type="text"
                value={data.productName}
                onChange={e => set('productName', e.target.value)}
              />
            </div>

            {/* Single-line fields */}
            {textFields.map(({ key, label, type }) => (
              <div className="ec-field-row" key={key}>
                <label className="ec-field-label">{label}</label>
                <input
                  className="ec-field-input"
                  type={type}
                  value={data[key]}
                  onChange={e => set(key, e.target.value)}
                />
              </div>
            ))}

            {/* Textarea fields */}
            {textareaFields.map(({ key, label }) => (
              <div className="ec-field-row" key={key}>
                <label className="ec-field-label">{label}</label>
                <textarea
                  className="ec-field-textarea"
                  value={data[key]}
                  onChange={e => set(key, e.target.value)}
                />
              </div>
            ))}

          </div>

          <button className="ec-update-btn" onClick={() => onUpdate(data)}>
            {t.updateBtn}
          </button>

        </div>
      </div>
    </div>
  );
}
