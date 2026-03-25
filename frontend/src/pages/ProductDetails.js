export default function ProductDetails({ lang, t, product, onBack, onEdit }) {
  const name    = lang === 'en' ? product.en    : product.jp;
  const company = lang === 'en' ? product.companyEn : product.companyJp;

  const fields = [
    { label: t.referenceIdLabel,    value: product.id },
    { label: t.companyNameCol,      value: company },
    { label: t.productName,         value: name },
    { label: t.productWebsite,      value: product.productWebsite      || '—' },
    { label: t.industry,            value: product.industry            || '—' },
    { label: t.employees,           value: product.employees           || '—' },
    { label: t.revenueScale,        value: product.revenueScale        || '—' },
    { label: t.brandStrategy,       value: product.brandStrategy       || '—' },
    { label: t.launchDate,          value: product.launchDate          || '—' },
    { label: t.pricingModel,        value: product.pricingModel        || '—' },
    { label: t.targetCustomers,     value: product.targetCustomers     || '—' },
    { label: t.usp,                 value: product.usp                 || '—' },
    { label: t.productSpecs,        value: product.productSpecs        || '—' },
    { label: t.toneAndManner,       value: product.toneAndManner       || '—' },
    { label: t.usageScenes,         value: product.usageScenes         || '—' },
    { label: t.customerInsight,     value: product.customerInsight     || '—' },
    { label: t.priceJustification,  value: product.priceJustification  || '—' },
    { label: t.salesMarketShare,    value: product.salesMarketShare    || '—' },
    { label: t.costStructure,       value: product.costStructure       || '—' },
    { label: t.pastPromotion,       value: product.pastPromotion       || '—' },
    { label: t.salesChannels,       value: product.salesChannels       || '—' },
    { label: t.swotAnalysis,        value: product.swotAnalysis        || '—' },
    { label: t.futureOutlook,       value: product.futureOutlook       || '—' },
    { label: t.notes,               value: product.notes               || '—' },
  ];

  return (
    <div className="page cd-page">

      {/* Header */}
      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>{t.back}</button>
        <span className="ac-title">{t.productDetails}</span>
        <button className="cd-edit-btn" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {t.editBtn}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="form-scroll">
        <div className="cd-container">

          <div className="cd-section-title">{t.basicInformation}</div>

          <div className="cd-fields-card">
            {fields.map(({ label, value }) => (
              <div className="cd-field-row" key={label}>
                <span className="cd-field-label">{label}</span>
                <div className="cd-field-value">{value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
