export default function AddPressRelease({
  lang, t,
  prUrl, setPrUrl, prAnalyzing, onAnalyze,
  prFormTitleEn, setPrFormTitleEn, prFormTitleJp, setPrFormTitleJp,
  prFormDate, setPrFormDate,
  prFormBodyEn, setPrFormBodyEn, prFormBodyJp, setPrFormBodyJp,
  onRegister, onBack,
}) {
  const titleVal = lang === 'en' ? prFormTitleEn : prFormTitleJp;
  const bodyVal  = lang === 'en' ? prFormBodyEn  : prFormBodyJp;

  function setTitle(v) { lang === 'en' ? setPrFormTitleEn(v) : setPrFormTitleJp(v); }
  function setBody(v)  { lang === 'en' ? setPrFormBodyEn(v)  : setPrFormBodyJp(v); }

  return (
    <div className="page apr-page">

      {/* Header */}
      <div className="ac-header">
        <button className="ac-back-btn" onClick={onBack}>  {t.back}</button>
        <span className="ac-title">{t.addPressRelease}</span>
      </div>

      {/* Scrollable content */}
      <div className="form-scroll">

        {/* White card */}
        <div className="apr-container">
          <div className="apr-card-title">{t.pressRelease}</div>

          {/* URL bar */}
          <div className="apr-url-bar">
            <input
              className="apr-url-input"
              type="text"
              value={prUrl}
              onChange={e => setPrUrl(e.target.value)}
            />
            <button
              className="btn-analyze"
              onClick={onAnalyze}
              disabled={!prUrl.trim() || prAnalyzing}
            >
              ✦ {t.analyze}
            </button>
          </div>

          {/* Fields card */}
          <div className="apr-fields-card">
            {/* Title */}
            <div className="apr-field-col">
              <label className="apr-field-label">{t.title}</label>
              <input
                className="apr-field-input"
                type="text"
                value={titleVal}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Release Date */}
            <div className="apr-field-col">
              <label className="apr-field-label">{t.releaseDate}</label>
              <input
                className="apr-field-input"
                type="date"
                value={prFormDate}
                onChange={e => setPrFormDate(e.target.value)}
              />
            </div>

            {/* Body text */}
            <div className="apr-field-col">
              <label className="apr-field-label">{t.bodyText}</label>
              <textarea
                className="apr-field-textarea"
                value={bodyVal}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          </div>
          {/* Buttons inside container */}
          <div className="apr-btn-row">
            <button className="apr-btn-back" onClick={onBack}>{t.backBtn}</button>
            <button className="apr-btn-register" onClick={onRegister}>{t.register}</button>
          </div>
        </div>

      </div>
    </div>
  );
}
