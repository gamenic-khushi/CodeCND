export default function FolderDetails({ lang, t, folder, onBack, onEdit }) {
  const fields = [
    { label: t.referenceIdLabel, value: folder?.id },
    { label: t.folderName,       value: lang === 'en' ? folder?.en        : folder?.jp },
    { label: t.productName,      value: lang === 'en' ? folder?.productEn : folder?.productJp },
    { label: t.companyNameCol,   value: lang === 'en' ? folder?.companyEn : folder?.companyJp },
  ];

  return (
    <div className="page cd-page">

      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>  {t.back}</button>
        <span className="ac-title">{t.folderDetails}</span>
        <button className="cd-edit-btn" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {t.editBtn}
        </button>
      </div>

      <div className="form-scroll">
        <div className="cd-container">
          <div className="cd-section-title">{t.basicInformation}</div>
          <div className="cd-fields-card">
            {fields.map((f, i) => (
              <div key={i} className="cd-field-row">
                <span className="cd-field-label">{f.label}</span>
                <span className="cd-field-value">{f.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
