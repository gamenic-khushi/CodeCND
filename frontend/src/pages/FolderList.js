export default function FolderList({
  lang, t,
  selectedCompany, selectedProduct,
  productFolders, folders,
  folderSearch, setFolderSearch,
  onSelectFolder, onBack,
}) {
  const bilingualFolders = productFolders[selectedProduct?.id];
  const folderList = bilingualFolders
    ? bilingualFolders.filter(f =>
        f.en.toLowerCase().includes(folderSearch.toLowerCase()) ||
        f.jp.toLowerCase().includes(folderSearch.toLowerCase())
      )
    : folders.filter(f => f.toLowerCase().includes(folderSearch.toLowerCase()));
  const companyName = selectedCompany ? (lang === 'en' ? selectedCompany.en : selectedCompany.jp) : '';
  const productName = selectedProduct ? (lang === 'en' ? selectedProduct.en : selectedProduct.jp) : '';

  return (
    <div className="page company-page">
      <div className="page-toolbar">
        <div className="toolbar-left">
          <button className="btn-add">{t.addButton}</button>
          <span className="toolbar-breadcrumb">
            <span className="toolbar-crumb-link" onClick={onBack}>{companyName}</span>
            <span className="toolbar-crumb-sep">›</span>
            <span className="toolbar-crumb-current">{productName}</span>
          </span>
        </div>
        <div className="search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder={t.searchHere}
            value={folderSearch} onChange={e => setFolderSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-card">
        <div className="table-header"><span>{t.folderName}</span></div>
        <div className="table-body">
          {bilingualFolders
            ? folderList.map(folder => (
                <div key={folder.id} className="table-row" onClick={() => onSelectFolder(folder)}>
                  {lang === 'en' ? folder.en : folder.jp}
                </div>
              ))
            : folderList.map((folder, i) => (
                <div key={i} className="table-row" onClick={() => onSelectFolder(folder)}>
                  {folder}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}
