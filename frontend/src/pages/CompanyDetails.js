export default function CompanyDetails({ lang, t, company, onBack, onEdit }) {
  const name = lang === 'en' ? company.en : company.jp;

  const fields = [
    { label: t.referenceIdLabel,      value: company.id },
    { label: t.companyNameLabel,      value: name },
    { label: t.companyWebsite,        value: company.companyWebsite        || '' },
    { label: t.industry,              value: company.industry              || '' },
    { label: t.employees,             value: company.employees             || '' },
    { label: t.revenueScale,          value: company.revenueScale          || '' },
    { label: t.brandConcept,          value: company.brandConcept          || '' },
    { label: t.companyCategories,     value: company.companyCategories     || '' },
    { label: t.headquartersLocation,  value: company.headquartersLocation  || '' },
    { label: t.foundingDate,          value: company.foundingDate          || '' },
    { label: t.businessActivities,    value: company.businessActivities    || '' },
    { label: t.mainProducts,          value: company.mainProducts          || '' },
    { label: t.salesScale,            value: company.salesScale            || '' },
    { label: t.marketShare,           value: company.marketShare           || '' },
    { label: t.targetCustomer,        value: company.targetCustomer        || '' },
    { label: t.competitors,           value: company.competitors           || '' },
    { label: t.missionVision,         value: company.missionVision         || '' },
    { label: t.brandStrategy,         value: company.brandStrategy         || '' },
    { label: t.promotionHistory,      value: company.promotionHistory      || '' },
    { label: t.swot,                  value: company.swot                  || '' },
    { label: t.valueProposition,      value: company.valueProposition      || '' },
    { label: t.futureStrategy,        value: company.futureStrategy        || '' },
    { label: t.notes,                 value: company.notes                 || '' },
  ];

  return (
    <div className="page cd-page">

      {/* Header */}
      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>{t.back}</button>
        <span className="ac-title">{t.companyDetails}</span>
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

          {/* Section title */}
          <div className="cd-section-title">{t.basicInformation}</div>

          {/* Fields card */}
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
