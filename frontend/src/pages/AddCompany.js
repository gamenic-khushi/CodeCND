import { getFormFields } from '../data';
import PressRelease from './PressRelease';
import AddPressRelease from './AddPressRelease';

export default function AddCompany({
  lang, t,
  activeTab, setActiveTab,
  urlInput, setUrlInput,
  formData, setFormData,
  onBack, onSave, handlePaste,
  prView, setPrView,
  // Press Release tab
  prRows, prSearch, setPrSearch, prSort, prCopied,
  onPrSort, onDeletePrRow, onCopyRefId,
  // Add Press Release form
  prUrl, setPrUrl, prAnalyzing, onAnalyzePrUrl,
  prFormTitleEn, setPrFormTitleEn, prFormTitleJp, setPrFormTitleJp,
  prFormDate, setPrFormDate,
  prFormBodyEn, setPrFormBodyEn, prFormBodyJp, setPrFormBodyJp,
  onRegisterPressRelease,
}) {
  const formFields = getFormFields(t);

  function setField(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  if (prView === 'add') {
    return (
      <AddPressRelease
        lang={lang} t={t}
        prUrl={prUrl} setPrUrl={setPrUrl}
        prAnalyzing={prAnalyzing} onAnalyze={onAnalyzePrUrl}
        prFormTitleEn={prFormTitleEn} setPrFormTitleEn={setPrFormTitleEn}
        prFormTitleJp={prFormTitleJp} setPrFormTitleJp={setPrFormTitleJp}
        prFormDate={prFormDate} setPrFormDate={setPrFormDate}
        prFormBodyEn={prFormBodyEn} setPrFormBodyEn={setPrFormBodyEn}
        prFormBodyJp={prFormBodyJp} setPrFormBodyJp={setPrFormBodyJp}
        onRegister={onRegisterPressRelease}
        onBack={() => setPrView('list')}
      />
    );
  }

  return (
    <div className="page add-company-page">

      {/* Top header */}
      <div className="ac-header">
        <button className="ac-back-btn" onClick={activeTab === 1 ? () => setActiveTab(0) : onBack}>{t.back}</button>
        <span className="ac-title">{activeTab === 1 ? t.addPressRelease : t.addCompany}</span>
      </div>

      {/* Scrollable content */}
      <div className="form-scroll">
        <div className="ac-container">

          {/* Tabs — only visible on Basic Info tab */}
          {activeTab === 0 && (
            <div className="tab-bar">
              {[t.basicInformation, t.pressRelease].map((tab, i) => (
                <button
                  key={i}
                  className={`tab-btn${activeTab === i ? ' active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {activeTab === 0 ? (
            <>
              {/* URL bar */}
              <div className="url-bar">
                <input
                  className="url-input"
                  type="text"
                  placeholder={t.pleaseEnterUrl}
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                />
                <button className="btn-analyze" onClick={handlePaste}>
                  ✦ {t.analyze}
                </button>
              </div>

              {/* Form fields */}
              <div className="ac-fields-card">
                {formFields.map(({ key, label, type, textarea, required }) => (
                  <div className={`ac-field${textarea ? ' textarea-field' : ''}`} key={key}>
                    <label className="ac-label">{label}{required && <span className="ac-required">*</span>}</label>
                    {textarea ? (
                      <textarea
                        className="form-textarea"
                        value={formData[key]}
                        onChange={e => setField(key, e.target.value)}
                      />
                    ) : (
                      <input
                        className="ac-input"
                        type={type || 'text'}
                        value={formData[key]}
                        onChange={e => setField(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button className="btn-form-save" onClick={onSave}>{t.save}</button>
            </>
          ) : (
            <PressRelease
              lang={lang} t={t}
              prRows={prRows}
              prSearch={prSearch} setPrSearch={setPrSearch}
              prSort={prSort} prCopied={prCopied}
              onAddClick={() => setPrView('add')}
              onPrSort={onPrSort}
              onDeleteRow={onDeletePrRow}
              onCopyRefId={onCopyRefId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
