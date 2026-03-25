import { useState } from 'react';

export default function EditCompany({ lang, t, company, onBack, onUpdate }) {
  const [data, setData] = useState({
    companyName:          lang === 'en' ? company.en : company.jp,
    companyWebsite:       company.companyWebsite       || '',
    industry:             company.industry             || '',
    employees:            company.employees            || '',
    revenueScale:         company.revenueScale         || '',
    brandConcept:         company.brandConcept         || '',
    companyCategories:    company.companyCategories    || '',
    headquartersLocation: company.headquartersLocation || '',
    foundingDate:         company.foundingDate         || '',
    businessActivities:   company.businessActivities   || '',
    mainProducts:         company.mainProducts         || '',
    salesScale:           company.salesScale           || '',
    marketShare:          company.marketShare          || '',
    targetCustomer:       company.targetCustomer       || '',
    competitors:          company.competitors          || '',
    missionVision:        company.missionVision        || '',
    brandStrategy:        company.brandStrategy        || '',
    promotionHistory:     company.promotionHistory     || '',
    swot:                 company.swot                 || '',
    valueProposition:     company.valueProposition     || '',
    futureStrategy:       company.futureStrategy       || '',
    notes:                company.notes                || '',
  });

  function set(key, val) { setData(prev => ({ ...prev, [key]: val })); }

  const textFields = [
    { key: 'companyName',          label: t.companyNameLabel,      placeholder: lang === 'en' ? company.en : company.jp },
    { key: 'companyWebsite',       label: t.companyWebsite,        placeholder: 'Example' },
    { key: 'industry',             label: t.industry,              placeholder: 'Industry Example' },
    { key: 'employees',            label: t.employees,             placeholder: 'Enter number of employees' },
    { key: 'revenueScale',         label: t.revenueScale,          placeholder: 'Enter revenue scale' },
    { key: 'brandConcept',         label: t.brandConcept,          placeholder: 'Enter brand concept' },
    { key: 'companyCategories',    label: t.companyCategories,     placeholder: 'Enter company categories' },
    { key: 'headquartersLocation', label: t.headquartersLocation,  placeholder: 'Enter headquarters location' },
    { key: 'foundingDate',         label: t.foundingDate,          placeholder: '',  type: 'date' },
    { key: 'salesScale',           label: t.salesScale,            placeholder: 'Enter sales scale' },
    { key: 'marketShare',          label: t.marketShare,           placeholder: 'Enter market share' },
  ];

  const textareaFields = [
    { key: 'businessActivities', label: t.businessActivities },
    { key: 'mainProducts',       label: t.mainProducts },
    { key: 'targetCustomer',     label: t.targetCustomer },
    { key: 'competitors',        label: t.competitors },
    { key: 'missionVision',      label: t.missionVision },
    { key: 'brandStrategy',      label: t.brandStrategy },
    { key: 'promotionHistory',   label: t.promotionHistory },
    { key: 'swot',               label: t.swot },
    { key: 'valueProposition',   label: t.valueProposition },
    { key: 'futureStrategy',     label: t.futureStrategy },
    { key: 'notes',              label: t.notes },
  ];

  return (
    <div className="page ec-page">

      {/* Header */}
      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>{t.back}</button>
        <span className="ac-title">{t.editCompany}</span>
      </div>

      {/* Scrollable content */}
      <div className="form-scroll">
        <div className="ec-container">

          {/* Section title */}
          <div className="cd-section-title">{t.basicInformation}</div>

          {/* Fields card */}
          <div className="ec-fields-card">

            {/* Single-line fields */}
            {textFields.map(({ key, label, placeholder, type }) => (
              <div className="ec-field-row" key={key}>
                <label className="ec-field-label">{label}</label>
                <input
                  className="ec-field-input"
                  type={type || 'text'}
                  value={data[key]}
                  placeholder={placeholder}
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

          {/* Update button */}
          <button className="ec-update-btn" onClick={() => onUpdate(data)}>
            {t.updateBtn}
          </button>

        </div>
      </div>
    </div>
  );
}
