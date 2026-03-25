import { useState, useEffect } from 'react';
import './App.css';
import translations from './translations';
import { INITIAL_FILE_ROWS, INITIAL_PR_ROWS, INITIAL_PRODUCTS, INITIAL_FOLDERS, EMPTY_FORM } from './data';
import CompanyList    from './pages/CompanyList';
import CompanyDetails from './pages/CompanyDetails';
import EditCompany     from './pages/EditCompany';
import ProductDetails  from './pages/ProductDetails';
import EditProduct     from './pages/EditProduct';
import AddProduct     from './pages/AddProduct';
import AddCompany     from './pages/AddCompany';
import AddFolder      from './pages/AddFolder';
import ProductList    from './pages/ProductList';
import FolderList     from './pages/FolderList';
import FileListPage   from './pages/FileListPage';
import ViewFile       from './pages/ViewFile';
import EditFile       from './pages/EditFile';
import AddChat        from './pages/AddChat';
import AddFile        from './pages/AddFile';
import FolderListPage from './pages/FolderListPage';
import FolderDetails  from './pages/FolderDetails';
import EditFolder     from './pages/EditFolder';
import FileList       from './pages/FileList';
import UploadFile     from './pages/UploadFile';
import FilePage       from './pages/FilePage';

import { db, auth } from './appwrite';
import LoginPage from './pages/LoginPage';

const API = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await auth.logout().catch(() => {});
    localStorage.removeItem('cnd_logged_in');
    setUser(null);
  }

  function handleCacheClear() {
    localStorage.clear();
    window.location.reload();
  }

  const [lang, setLang]           = useState('en');
  const [activeNav, setActiveNav] = useState(0);
  const [subPage, setSubPage]     = useState('list');
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]               = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [folderSearch, setFolderSearch]   = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [urlInput, setUrlInput]   = useState('');
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [companies, setCompanies] = useState([
    { id: 'co0001', en: 'Company A',               jp: 'カンパニーA' },
    { id: 'co0002', en: 'Beer',                    jp: 'ビール' },
    { id: 'co0003', en: 'Kanro',                   jp: 'カンロ' },
    { id: 'co0005', en: 'Apple Inc.',              jp: 'アップル株式会社' },
    { id: 'co0006', en: 'Shiseido',                jp: '資生堂' },
    { id: 'co0007', en: 'test',                    jp: 'テスト' },
    { id: 'co0011', en: "McDonald's",              jp: 'マクドナルド' },
    { id: 'co0012', en: 'Nissan Motor Corporation', jp: '日産自動車株式会社' },
  ]);
  const [companySort, setCompanySort]       = useState({ col: 'id', dir: 'asc' });
  const [companyChecked, setCompanyChecked] = useState(new Set());
  const [toast, setToast]                   = useState(null);
  const [products, setProducts]             = useState(INITIAL_PRODUCTS);
  const [productFilter, setProductFilter]   = useState('');
  const [productChecked, setProductChecked] = useState(new Set());
  const [folderRows, setFolderRows]             = useState(INITIAL_FOLDERS);
  const [folderFilter, setFolderFilter]         = useState('');
  const [folderChecked, setFolderChecked]       = useState(new Set());
  const [selectedFolderRow, setSelectedFolderRow] = useState(null);
  const [fileListKey, setFileListKey]           = useState(0);
  const [selectedFileRow, setSelectedFileRow]   = useState(null);
  const [selectedFileFolder, setSelectedFileFolder] = useState(null);

  const t          = translations[lang];
  async function toggleLang() {
    const next = lang === 'en' ? 'jp' : 'en';
    setLang(next);
    if (next !== 'jp') return;

    // Translate any items where jp === en (never translated)
    const untranslatedCompanies = companies.filter(c => c.en && c.jp === c.en);
    const untranslatedProducts  = products.filter(p => p.en && p.jp === p.en);
    const untranslatedFolders   = folderRows.filter(f => f.en && f.jp === f.en);

    const allTexts = [
      ...untranslatedCompanies.map(c => c.en),
      ...untranslatedProducts.map(p => p.en),
      ...untranslatedFolders.map(f => f.en),
    ];
    if (allTexts.length === 0) return;

    const translated = await translateToJp(allTexts);
    if (!translated) return;

    let offset = 0;
    if (untranslatedCompanies.length) {
      const slice = translated.slice(offset, offset + untranslatedCompanies.length);
      setCompanies(prev => prev.map(c => {
        const i = untranslatedCompanies.findIndex(x => x.id === c.id);
        if (i === -1) return c;
        const jp = slice[i] || c.en;
        if (c._awid) db.update('companies', c._awid, { ...c, jp }).catch(() => {});
        return { ...c, jp };
      }));
      offset += untranslatedCompanies.length;
    }
    if (untranslatedProducts.length) {
      const slice = translated.slice(offset, offset + untranslatedProducts.length);
      setProducts(prev => prev.map(p => {
        const i = untranslatedProducts.findIndex(x => x.id === p.id);
        if (i === -1) return p;
        const jp = slice[i] || p.en;
        if (p._awid) db.update('products', p._awid, { ...p, jp }).catch(() => {});
        return { ...p, jp };
      }));
      offset += untranslatedProducts.length;
    }
    if (untranslatedFolders.length) {
      const slice = translated.slice(offset, offset + untranslatedFolders.length);
      setFolderRows(prev => prev.map(f => {
        const i = untranslatedFolders.findIndex(x => x.id === f.id);
        if (i === -1) return f;
        const jp = slice[i] || f.en;
        if (f._awid) db.update('folders', f._awid, { ...f, jp }).catch(() => {});
        return { ...f, jp };
      }));
    }
  }

  // ── File Editor state ──────────────────────────────────────
  const [folders, setFolders]               = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [fileName, setFileName]             = useState('');
  const [promptText, setPromptText]         = useState('');
  const [chatInput, setChatInput]           = useState('');
  const [messages, setMessages]             = useState([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [copied, setCopied]                 = useState(null);

  // ── File Table state ───────────────────────────────────────
  const [fileView, setFileView]     = useState('table');
  const [fileRows, setFileRows]     = useState(INITIAL_FILE_ROWS);
  const [fileSearch, setFileSearch] = useState('');
  const [fileCopied, setFileCopied] = useState(null);

  // ── Upload page state ──────────────────────────────────────
  const [uploadFolder, setUploadFolder]   = useState('');
  const [uploadFile, setUploadFile]       = useState(null);
  const [uploadStatus, setUploadStatus]   = useState('idle');
  const [isDragging, setIsDragging]       = useState(false);
  const [uploadChat, setUploadChat]       = useState('');
  const [uploadOutput, setUploadOutput]   = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // ── Press Release state ────────────────────────────────────
  const [prRows, setPrRows]     = useState(INITIAL_PR_ROWS);
  const [prSearch, setPrSearch] = useState('');
  const [prSort, setPrSort]     = useState({ col: 'refId', dir: 'asc' });
  const [prCopied, setPrCopied] = useState(null);
  const [prView, setPrView]     = useState('list');
  const [prUrl, setPrUrl]       = useState('');
  const [prAnalyzing, setPrAnalyzing] = useState(false);
  const [prFormTitleEn, setPrFormTitleEn] = useState('');
  const [prFormTitleJp, setPrFormTitleJp] = useState('');
  const [prFormDate,    setPrFormDate]    = useState('');
  const [prFormBodyEn,  setPrFormBodyEn]  = useState('');
  const [prFormBodyJp,  setPrFormBodyJp]  = useState('');

  useEffect(() => { document.documentElement.lang = lang === 'jp' ? 'ja' : 'en'; }, [lang]);

  useEffect(() => {
    fetch(`${API}/folders`)
      .then(r => r.json())
      .then(d => setFolders(d.folders || d.subfolders || []))
      .catch(() => {});
  }, []);

  // Load all collections from Appwrite once the user is authenticated
  useEffect(() => {
    if (!user) return;
    db.list('files').then(docs => { if (docs.length) setFileRows(docs); }).catch(() => {});
    db.list('pressReleases').then(docs => { if (docs.length) setPrRows(docs); }).catch(() => {});

    // Load companies, products, folders together so we can do client-side joins
    Promise.all([
      db.list('companies').catch(() => []),
      db.list('products').catch(() => []),
      db.list('folders').catch(() => []),
    ]).then(([companyDocs, productDocs, folderDocs]) => {
      if (companyDocs.length) setCompanies(companyDocs);

      // Enrich products with companyEn/companyJp from companies
      const enrichedProducts = productDocs.map(product => {
        const company = companyDocs.find(c => c._awid === product.companyId || c.id === product.companyId);
        return {
          ...product,
          companyEn: company ? company.en : '',
          companyJp: company ? company.jp : '',
        };
      });
      if (enrichedProducts.length) setProducts(enrichedProducts);

      // Enrich folders with productEn/productJp/companyEn/companyJp via productId
      if (folderDocs.length) {
        const enriched = folderDocs.map(folder => {
          const product = enrichedProducts.find(p => p._awid === folder.productId);
          if (product) {
            return {
              ...folder,
              companyEn: product.companyEn || '',
              companyJp: product.companyJp || '',
              productEn: product.en        || '',
              productJp: product.jp        || '',
            };
          }
          return folder;
        });
        setFolderRows(enriched);
      }
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────
  function dbErr(err) { setToast('⚠ ' + (err?.message || 'Save failed')); console.error(err); }

  async function translateToJp(texts) {
    try {
      const res = await fetch(`${API}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts }),
      });
      if (!res.ok) return null;
      const d = await res.json();
      return d.translated || null;
    } catch { return null; }
  }

  // ── Handlers ──────────────────────────────────────────────

  async function handleSaveCompany() {
    const name = formData.companyName.trim() || `Company ${companies.length + 1}`;
    const nums = companies.map(c => parseInt(c.id.replace('co', '')) || 0);
    const nextNum = Math.max(0, ...nums) + 1;
    const newId = `co${String(nextNum).padStart(4, '0')}`;
    const newCompany = { id: newId, en: name, jp: name };
    setCompanies(prev => [...prev, newCompany]);
    setFormData(EMPTY_FORM);
    setSubPage('list');
    // Translate name to Japanese in background
    translateToJp([name]).then(translated => {
      if (translated?.[0]) {
        const jp = translated[0];
        setCompanies(prev => prev.map(c => c.id === newId ? { ...c, jp } : c));
        db.create('companies', { ...newCompany, jp, ...formData })
          .then(saved => setCompanies(prev => prev.map(c => c.id === newId ? { ...c, _awid: saved._awid } : c)))
          .catch(dbErr);
      } else {
        db.create('companies', { ...newCompany, ...formData })
          .then(saved => setCompanies(prev => prev.map(c => c.id === newId ? { ...c, _awid: saved._awid } : c)))
          .catch(dbErr);
      }
    });
  }

  function handlePaste() {
    navigator.clipboard.readText().then(text => setUrlInput(text)).catch(() => {});
  }

  async function handleGenerate() {
    const text = chatInput.trim();
    if (!text || isLoading) return;
    const userMsg = { id: Date.now(), role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setChatInput('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: d.reply || d.message || d.content || '' }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: `Error: ${err.message}`, isError: true }]);
    } finally { setIsLoading(false); }
  }

  function handleFileSave() {
    if (!promptText) return;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([promptText], { type: 'text/plain' })),
      download: `prompt-${Date.now()}.txt`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleCopy(id, text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  }

  function handleDeletePrRow(id) {
    const row = prRows.find(r => r.id === id);
    setPrRows(prev => prev.filter(r => r.id !== id));
    if (row?._awid) db.delete('pressReleases', row._awid).catch(dbErr);
  }

  function handlePrSort(col) {
    setPrSort(prev => ({ col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' }));
  }

  function handleCopyRefId(id, refId) {
    navigator.clipboard.writeText(refId).then(() => {
      setPrCopied(id);
      setTimeout(() => setPrCopied(null), 1500);
    });
  }

  async function handleAnalyzePrUrl() {
    if (!prUrl.trim() || prAnalyzing) return;
    setPrAnalyzing(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Summarize and extract title, date and body from this URL: ${prUrl}` }] }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      const reply = d.reply || d.message || d.content || '';
      if (lang === 'en') setPrFormBodyEn(reply); else setPrFormBodyJp(reply);
    } catch (err) {
      console.error('Analyze error:', err);
    } finally {
      setPrAnalyzing(false);
    }
  }

  function handleRegisterPressRelease() {
    const nums = prRows.map(r => parseInt(r.refId.replace('pr', '')) || 0);
    const next = Math.max(0, ...nums) + 1;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const newRow = {
      id: Date.now(),
      refId: `pr${String(next).padStart(4, '0')}`,
      date: prFormDate ? prFormDate.replace(/-/g, '/') : today,
      en: prFormTitleEn,
      jp: prFormTitleJp,
    };
    setPrRows(prev => [...prev, newRow]);
    setPrView('list');
    setActiveTab(1);
    db.create('pressReleases', newRow)
      .then(saved => setPrRows(prev => prev.map(r => r.refId === newRow.refId ? { ...r, _awid: saved._awid } : r)))
      .catch(dbErr);
  }

  function handleDeleteFileRow(id) {
    const row = fileRows.find(r => r.id === id);
    setFileRows(prev => prev.filter(r => r.id !== id));
    if (row?._awid) db.delete('files', row._awid).catch(dbErr);
  }

  function handleCopyFileRef(id, refId) {
    navigator.clipboard.writeText(refId).then(() => {
      setFileCopied(id);
      setTimeout(() => setFileCopied(null), 1500);
    });
  }

  function handleUploadSubmit() {
    if (!uploadFile || uploadStatus === 'uploading') return;
    setUploadStatus('uploading');
    setTimeout(() => setUploadStatus('done'), 1500);
  }

  async function handleUploadGenerate() {
    const text = uploadChat.trim();
    if (!text || uploadLoading) return;
    setUploadLoading(true);
    setUploadOutput('');
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: text }] }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      setUploadOutput(d.reply || d.message || d.content || '');
    } catch (err) {
      setUploadOutput(`Error: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  }

  function goNav(i) {
    setPrView('list');
    if (i === 1) setProductFilter('');
    if (i === 2) setFolderFilter('');
    if (i === 3) { setFileView('table'); setFileListKey(k => k + 1); }
    setActiveNav(i);
    setSubPage('list');
  }

  // ── Routing ────────────────────────────────────────────────

  function renderBody() {
    if (activeNav === 0) {
      if (subPage === 'companyDetails') {
        return (
          <CompanyDetails
            lang={lang} t={t}
            company={selectedCompany}
            onBack={() => setSubPage('list')}
            onEdit={() => setSubPage('editCompany')}
          />
        );
      }
      if (subPage === 'editCompany') {
        return (
          <EditCompany
            lang={lang} t={t}
            company={selectedCompany}
            onBack={() => setSubPage('list')}
            onUpdate={(data) => {
              const updated = {
                ...selectedCompany,
                ...data,
                en: lang === 'en' ? data.companyName : selectedCompany.en,
                jp: lang === 'jp' ? data.companyName : selectedCompany.jp,
              };
              setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? updated : c));
              setSelectedCompany(updated);
              setSubPage('companyDetails');
              setToast(t.updated);
              setTimeout(() => setToast(null), 3000);
              if (updated._awid) { const { _awid, ...d } = updated; db.update('companies', _awid, d).catch(dbErr); }
            }}
          />
        );
      }
      if (subPage === 'addFolder') {
        return (
          <AddFolder
            lang={lang} t={t}
            products={products}
            onBack={() => setSubPage('list')}
            onSave={async (entries) => {
              const baseNums = folderRows.map(f => parseInt((f.id || '').replace('fo', '')) || 0);
              const newFolders = entries.map(({ folderName, product }, i) => {
                const newId = `fo${String(Math.max(0, ...baseNums) + i + 1).padStart(4, '0')}`;
                return {
                  id: newId,
                  en: folderName, jp: folderName,
                  companyEn: product ? product.companyEn : t.noCompany,
                  companyJp: product ? product.companyJp : t.noCompany,
                  productEn: product ? product.en : '',
                  productJp: product ? product.jp : '',
                  productId: product ? product._awid : '',
                };
              });
              setFolderRows(prev => [...prev, ...newFolders]);
              setSubPage('list');
              setToast(t.updated);
              setTimeout(() => setToast(null), 3000);
              const names = newFolders.map(f => f.en);
              translateToJp(names).then(translated => {
                newFolders.forEach((folder, i) => {
                  const jp = translated?.[i] || folder.en;
                  setFolderRows(prev => prev.map(f => f.id === folder.id ? { ...f, jp } : f));
                  db.create('folders', { ...folder, jp })
                    .then(saved => setFolderRows(prev => prev.map(f => f.id === folder.id ? { ...f, _awid: saved._awid } : f)))
                    .catch(dbErr);
                });
              });
            }}
          />
        );
      }
      if (subPage === 'add') {
        return (
          <AddCompany
            lang={lang} t={t}
            activeTab={activeTab} setActiveTab={setActiveTab}
            urlInput={urlInput} setUrlInput={setUrlInput}
            formData={formData} setFormData={setFormData}
            onBack={() => setSubPage('list')}
            onSave={handleSaveCompany} handlePaste={handlePaste}
            prView={prView} setPrView={setPrView}
            prRows={prRows} prSearch={prSearch} setPrSearch={setPrSearch}
            prSort={prSort} prCopied={prCopied}
            onPrSort={handlePrSort} onDeletePrRow={handleDeletePrRow} onCopyRefId={handleCopyRefId}
            prUrl={prUrl} setPrUrl={setPrUrl}
            prAnalyzing={prAnalyzing} onAnalyzePrUrl={handleAnalyzePrUrl}
            prFormTitleEn={prFormTitleEn} setPrFormTitleEn={setPrFormTitleEn}
            prFormTitleJp={prFormTitleJp} setPrFormTitleJp={setPrFormTitleJp}
            prFormDate={prFormDate} setPrFormDate={setPrFormDate}
            prFormBodyEn={prFormBodyEn} setPrFormBodyEn={setPrFormBodyEn}
            prFormBodyJp={prFormBodyJp} setPrFormBodyJp={setPrFormBodyJp}
            onRegisterPressRelease={handleRegisterPressRelease}
          />
        );
      }
      return (
        <CompanyList
          lang={lang} t={t}
          companies={companies} setCompanies={setCompanies}
          search={search} setSearch={setSearch}
          companySort={companySort} setCompanySort={setCompanySort}
          companyChecked={companyChecked} setCompanyChecked={setCompanyChecked}
          onAddClick={() => setSubPage('add')}
          onSelectCompany={(company) => { setSelectedCompany(company); setProductSearch(''); goNav(1); }}
          onViewDetails={(company) => { setSelectedCompany(company); setSubPage('companyDetails'); }}
          onEditCompany={(company) => { setSelectedCompany(company); setSubPage('editCompany'); }}
          onDeleteCompany={(ids) => {
            const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
            const toDelete = companies.filter(c => idSet.has(c.id));
            setCompanies(prev => prev.filter(c => !idSet.has(c.id)));
            setToast(t.deleted);
            setTimeout(() => setToast(null), 3000);
            toDelete.forEach(c => { if (c._awid) db.delete('companies', c._awid).catch(dbErr); });
          }}
          onLinkCopy={(text) => {
            navigator.clipboard.writeText(text);
            setToast(t.linkCopied);
            setTimeout(() => setToast(null), 3000);
          }}
          onDuplicate={(company) => {
            const suffix = t.copyOf;
            const baseName = (name) => {
              // strip existing " Copy (N)" / "のコピー (N)" suffix to get original
              const enPattern = / Copy(?: \(\d+\))?$/;
              const jpPattern = /のコピー(?: \(\d+\))?$/;
              return name.replace(enPattern, '').replace(jpPattern, '');
            };
            const baseEn = baseName(company.en);
            const baseJp = baseName(company.jp);
            const copySuffixEn = ' Copy';
            const copySuffixJp = 'のコピー';
            // count existing copies to determine next number
            const copies = companies.filter(c =>
              c.en === `${baseEn}${copySuffixEn}` ||
              c.en.match(new RegExp(`^${baseEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Copy \\(\\d+\\)$`))
            );
            let newEn, newJp;
            if (copies.length === 0) {
              newEn = `${baseEn}${copySuffixEn}`;
              newJp = `${baseJp}${copySuffixJp}`;
            } else {
              const n = copies.length + 1;
              newEn = `${baseEn}${copySuffixEn} (${n})`;
              newJp = `${baseJp}${copySuffixJp} (${n})`;
            }
            const nums = companies.map(c => parseInt(c.id.replace('co', '')) || 0);
            const nextNum = Math.max(0, ...nums) + 1;
            const newId = `co${String(nextNum).padStart(4, '0')}`;
            const dupeCompany = { id: newId, en: newEn, jp: newJp };
            setCompanies(prev => [dupeCompany, ...prev]);
            setToast(t.duplicated);
            setTimeout(() => setToast(null), 3000);
            db.create('companies', dupeCompany)
              .then(saved => setCompanies(prev => prev.map(c => c.id === newId ? { ...c, _awid: saved._awid } : c)))
              .catch(dbErr);
          }}
        />
      );
    }

    if (activeNav === 1) {
      if (subPage === 'addProduct') {
        return (
          <AddProduct
            lang={lang} t={t}
            companies={companies}
            onBack={() => setSubPage('list')}
            onSave={async (data) => {
              const companyObj = companies.find(c => c.id === data.companyId);
              const nums = products.map(p => parseInt(p.id.replace('pr', '')) || 0);
              const newId = `pr${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
              const enName = data.productName || `Product ${products.length + 1}`;
              const newProduct = {
                id: newId,
                en: enName,
                jp: enName,
                companyId: data.companyId || null,
                companyEn: companyObj ? companyObj.en : t.noCompany,
                companyJp: companyObj ? companyObj.jp : t.noCompany,
                ...data,
              };
              setProducts(prev => [...prev, newProduct]);
              setSubPage('list');
              setToast(t.updated);
              setTimeout(() => setToast(null), 3000);
              translateToJp([enName]).then(translated => {
                const jp = translated?.[0] || enName;
                const finalProduct = { ...newProduct, jp };
                setProducts(prev => prev.map(p => p.id === newId ? { ...p, jp } : p));
                db.create('products', finalProduct)
                  .then(saved => setProducts(prev => prev.map(p => p.id === newId ? { ...p, _awid: saved._awid } : p)))
                  .catch(dbErr);
              });
            }}
          />
        );
      }
      if (subPage === 'productDetails') {
        return (
          <ProductDetails
            lang={lang} t={t}
            product={selectedProduct}
            onBack={() => setSubPage('list')}
            onEdit={() => setSubPage('editProduct')}
          />
        );
      }
      if (subPage === 'editProduct') {
        return (
          <EditProduct
            lang={lang} t={t}
            product={selectedProduct}
            companies={companies}
            onBack={() => setSubPage('list')}
            onUpdate={(data) => {
              const companyObj = companies.find(c => c.id === data.companyId);
              const updated = {
                ...selectedProduct,
                ...data,
                en: lang === 'en' ? data.productName : selectedProduct.en,
                jp: lang === 'jp' ? data.productName : selectedProduct.jp,
                companyId: data.companyId || null,
                companyEn: companyObj ? companyObj.en : t.noCompany,
                companyJp: companyObj ? companyObj.jp : t.noCompany,
              };
              setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));
              setSelectedProduct(updated);
              setSubPage('list');
              setToast(t.updated);
              setTimeout(() => setToast(null), 3000);
              if (updated._awid) { const { _awid, ...d } = updated; db.update('products', _awid, d).catch(dbErr); }
            }}
          />
        );
      }
      return (
        <ProductList
          lang={lang} t={t}
          products={products} setProducts={setProducts}
          companies={companies}
          productSearch={productSearch} setProductSearch={setProductSearch}
          productFilter={productFilter} setProductFilter={setProductFilter}
          productChecked={productChecked} setProductChecked={setProductChecked}
          onAddClick={() => setSubPage('addProduct')}
          onSelectProduct={(product) => { setSelectedProduct(product); setFolderSearch(''); goNav(2); }}
          onViewDetails={(product) => { setSelectedProduct(product); setSubPage('productDetails'); }}
          onEditProduct={(product) => { setSelectedProduct(product); setSubPage('editProduct'); }}
          onLinkCopy={(text) => { navigator.clipboard.writeText(text); setToast(t.linkCopied); setTimeout(() => setToast(null), 3000); }}
          onDuplicate={(product) => {
            const copySuffixEn = ' Copy';
            const copySuffixJp = 'のコピー';
            const stripSuffix = (name) => name
              .replace(/ Copy(?: \(\d+\))?$/, '')
              .replace(/のコピー(?: \(\d+\))?$/, '');
            const baseEn = stripSuffix(product.en);
            const baseJp = stripSuffix(product.jp);
            const copies = products.filter(p =>
              p.en === `${baseEn}${copySuffixEn}` ||
              p.en.match(new RegExp(`^${baseEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Copy \\(\\d+\\)$`))
            );
            const newEn = copies.length === 0 ? `${baseEn}${copySuffixEn}` : `${baseEn}${copySuffixEn} (${copies.length + 1})`;
            const newJp = copies.length === 0 ? `${baseJp}${copySuffixJp}` : `${baseJp}${copySuffixJp} (${copies.length + 1})`;
            const nums = products.map(p => parseInt(p.id.replace('pr', '')) || 0);
            const newId = `pr${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
            const { _awid: _pa, ...productWithoutAwid } = product;
            const dupeProduct = { ...productWithoutAwid, id: newId, en: newEn, jp: newJp };
            setProducts(prev => [dupeProduct, ...prev]);
            setToast(t.duplicated);
            setTimeout(() => setToast(null), 3000);
            db.create('products', dupeProduct)
              .then(saved => setProducts(prev => prev.map(p => p.id === newId ? { ...p, _awid: saved._awid } : p)))
              .catch(dbErr);
          }}
          onDeleteProduct={(ids) => {
            const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
            const toDelete = products.filter(p => idSet.has(p.id));
            setProducts(prev => prev.filter(p => !idSet.has(p.id)));
            setToast(t.deleted);
            setTimeout(() => setToast(null), 3000);
            toDelete.forEach(p => { if (p._awid) db.delete('products', p._awid).catch(dbErr); });
          }}
        />
      );
    }

    if (activeNav === 2) {
      if (subPage === 'addFolder') {
        return (
          <AddFolder
            lang={lang} t={t}
            products={products}
            onBack={() => setSubPage('list')}
            onSave={async (entries) => {
              const baseNums = folderRows.map(f => parseInt((f.id || '').replace('fo', '')) || 0);
              const newFolders = entries.map(({ folderName, product }, i) => {
                const newId = `fo${String(Math.max(0, ...baseNums) + i + 1).padStart(4, '0')}`;
                return {
                  id: newId,
                  en: folderName, jp: folderName,
                  companyEn: product ? product.companyEn : t.noCompany,
                  companyJp: product ? product.companyJp : t.noCompany,
                  productEn: product ? product.en : '',
                  productJp: product ? product.jp : '',
                  productId: product ? product._awid : '',
                };
              });
              setFolderRows(prev => [...prev, ...newFolders]);
              setSubPage('list');
              setToast(t.updated);
              setTimeout(() => setToast(null), 3000);
              const names = newFolders.map(f => f.en);
              translateToJp(names).then(translated => {
                newFolders.forEach((folder, i) => {
                  const jp = translated?.[i] || folder.en;
                  setFolderRows(prev => prev.map(f => f.id === folder.id ? { ...f, jp } : f));
                  db.create('folders', { ...folder, jp })
                    .then(saved => setFolderRows(prev => prev.map(f => f.id === folder.id ? { ...f, _awid: saved._awid } : f)))
                    .catch(dbErr);
                });
              });
            }}
          />
        );
      }
      if (subPage === 'folderDetails') {
        return (
          <FolderDetails
            lang={lang} t={t}
            folder={selectedFolderRow}
            onBack={() => setSubPage('list')}
            onEdit={() => setSubPage('editFolder')}
          />
        );
      }
      if (subPage === 'editFolder') {
        return (
          <EditFolder
            lang={lang} t={t}
            folder={selectedFolderRow}
            products={products}
            onBack={() => setSubPage('list')}
            onUpdate={(data) => {
              const updated = { ...selectedFolderRow, ...data };
              setFolderRows(prev => prev.map(f => f.id === selectedFolderRow.id ? updated : f));
              setSelectedFolderRow(updated);
              setSubPage('list');
              setToast(t.updated);
              setTimeout(() => setToast(null), 3000);
              if (updated._awid) { const { _awid, ...d } = updated; db.update('folders', _awid, d).catch(dbErr); }
            }}
          />
        );
      }
      return (
        <FolderListPage
          lang={lang} t={t}
          folderRows={folderRows} setFolderRows={setFolderRows}
          folderFilter={folderFilter} setFolderFilter={setFolderFilter}
          folderChecked={folderChecked} setFolderChecked={setFolderChecked}
          folderSearch={folderSearch} setFolderSearch={setFolderSearch}
          onAddClick={() => setSubPage('addFolder')}
          onLinkCopy={(text) => { navigator.clipboard.writeText(text); setToast(t.linkCopied); setTimeout(() => setToast(null), 3000); }}
          onDuplicate={(folder) => {
            const copySuffixEn = ' Copy';
            const copySuffixJp = 'のコピー';
            const strip = (n) => n.replace(/ Copy(?: \(\d+\))?$/, '').replace(/のコピー(?: \(\d+\))?$/, '');
            const baseEn = strip(folder.en);
            const baseJp = strip(folder.jp);
            const copies = folderRows.filter(f =>
              f.en === `${baseEn}${copySuffixEn}` ||
              f.en.match(new RegExp(`^${baseEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Copy \\(\\d+\\)$`))
            );
            const newEn = copies.length === 0 ? `${baseEn}${copySuffixEn}` : `${baseEn}${copySuffixEn} (${copies.length + 1})`;
            const newJp = copies.length === 0 ? `${baseJp}${copySuffixJp}` : `${baseJp}${copySuffixJp} (${copies.length + 1})`;
            const nums = folderRows.map(f => parseInt(f.id.replace('fo', '')) || 0);
            const newId = `fo${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
            const { _awid: _fa, ...folderWithoutAwid } = folder;
            const dupeFolder = { ...folderWithoutAwid, id: newId, en: newEn, jp: newJp };
            setFolderRows(prev => [dupeFolder, ...prev]);
            setToast(t.duplicated);
            setTimeout(() => setToast(null), 3000);
            db.create('folders', dupeFolder)
              .then(saved => setFolderRows(prev => prev.map(f => f.id === newId ? { ...f, _awid: saved._awid } : f)))
              .catch(dbErr);
          }}
          onViewDetails={(folder) => { setSelectedFolderRow(folder); setSubPage('folderDetails'); }}
          onEditFolder={(folder) => { setSelectedFolderRow(folder); setSubPage('editFolder'); }}
          onDeleteFolder={(ids) => {
            const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
            const toDelete = folderRows.filter(f => idSet.has(f.id));
            setFolderRows(prev => prev.filter(f => !idSet.has(f.id)));
            setToast(t.deleted);
            setTimeout(() => setToast(null), 3000);
            toDelete.forEach(f => { if (f._awid) db.delete('folders', f._awid).catch(dbErr); });
          }}
        />
      );
    }

    if (activeNav === 3) {
      if (subPage === 'viewFile') {
        return (
          <ViewFile
            lang={lang} t={t}
            file={selectedFileRow}
            folder={selectedFileFolder}
            onBack={() => setSubPage('list')}
          />
        );
      }
      if (subPage === 'addFile') {
        return (
          <AddFile
            lang={lang} t={t}
            folders={folderRows}
            onBack={() => setSubPage('list')}
            onUpload={() => setSubPage('list')}
          />
        );
      }
      if (subPage === 'addChat') {
        return (
          <AddChat
            lang={lang} t={t}
            folders={folderRows}
            onBack={() => setSubPage('list')}
            onSave={() => setSubPage('list')}
          />
        );
      }
      if (subPage === 'editFile') {
        return (
          <EditFile
            lang={lang} t={t}
            file={selectedFileRow}
            folder={selectedFileFolder}
            folders={folderRows}
            onBack={() => setSubPage('list')}
            onSave={() => setSubPage('list')}
          />
        );
      }
      if (fileView === 'table' && subPage === 'list') {
        return (
          <FileListPage
            key={fileListKey}
            lang={lang} t={t}
            companies={companies}
            products={products}
            folderRows={folderRows}
            fileRows={fileRows}
            onAddFolder={() => setSubPage('addChat')}
            onAddFile={() => setSubPage('addFile')}
            onUpload={() => { setUploadFile(null); setUploadStatus('idle'); setUploadOutput(''); setUploadChat(''); setFileView('upload'); setSubPage('files'); }}
            showToast={(msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); }}
            onDeleteFile={(ids) => {
              const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
              const toDelete = fileRows.filter(f => idSet.has(f.id));
              setFileRows(prev => prev.filter(f => !idSet.has(f.id)));
              toDelete.forEach(f => { if (f._awid) db.delete('files', f._awid).catch(dbErr); });
            }}
            onDuplicateFile={(file) => {
              const nums = fileRows.map(f => parseInt((f.refId || '').replace('fa', '')) || 0);
              const newRefId = `fa${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
              const { _awid, ...fileWithoutAwid } = file;
              const dupeFile = { ...fileWithoutAwid, id: Date.now(), refId: newRefId, en: file.en + ' Copy', jp: file.jp + ' のコピー' };
              setFileRows(prev => [dupeFile, ...prev]);
              db.create('files', dupeFile)
                .then(saved => setFileRows(prev => prev.map(f => f.refId === newRefId ? { ...f, _awid: saved._awid } : f)))
                .catch(dbErr);
            }}
            onViewFile={(file, folder) => { setSelectedFileRow(file); setSelectedFileFolder(folder); setSubPage('viewFile'); }}
            onEditFile={(file, folder) => { setSelectedFileRow(file); setSelectedFileFolder(folder); setSubPage('editFile'); }}
          />
        );
      }
      if (fileView === 'editor') {
        return (
          <FilePage
            lang={lang} t={t}
            folders={folders}
            selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}
            fileName={fileName} setFileName={setFileName}
            promptText={promptText} setPromptText={setPromptText}
            chatInput={chatInput} setChatInput={setChatInput}
            messages={messages} isLoading={isLoading} copied={copied}
            onFileSave={handleFileSave} onCopy={handleCopy}
            onChatKey={handleChatKey} onGenerate={handleGenerate}
          />
        );
      }
      if (fileView === 'upload') {
        return (
          <UploadFile
            lang={lang} t={t}
            uploadFolder={uploadFolder} setUploadFolder={setUploadFolder}
            uploadFile={uploadFile} setUploadFile={setUploadFile}
            uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
            isDragging={isDragging} setIsDragging={setIsDragging}
            uploadChat={uploadChat} setUploadChat={setUploadChat}
            uploadOutput={uploadOutput} uploadLoading={uploadLoading}
            onUploadSubmit={handleUploadSubmit} onUploadGenerate={handleUploadGenerate}
            onBack={() => setFileView('table')}
          />
        );
      }
      return (
        <FileList
          lang={lang} t={t}
          selectedCompany={selectedCompany}
          selectedProduct={selectedProduct}
          selectedFolder={selectedFolder}
          fileRows={fileRows} fileSearch={fileSearch} setFileSearch={setFileSearch}
          fileCopied={fileCopied}
          onDeleteRow={handleDeleteFileRow} onCopyFileRef={handleCopyFileRef}
          onOpenEditor={() => setFileView('editor')}
          onOpenUpload={() => { setUploadFile(null); setUploadStatus('idle'); setUploadOutput(''); setUploadChat(''); setFileView('upload'); }}
          onNavToCompany={() => goNav(1)}
          onNavToProduct={() => goNav(2)}
        />
      );
    }

    return <div className="page empty-page"><p>This page is under construction.</p></div>;
  }

  if (!user) return <LoginPage onLogin={u => setUser(u)} />;

  return (
    <div className="app">
      <div className="accent-line" />

      <nav className="navbar">
        <div className="nav-logo">
          <svg width="55" height="17" viewBox="0 0 55 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M29.6644 12.4029V0.0302734H26.9617V0.0543465L12.7227 16.248H16.124L26.963 3.89019V16.2454H29.6644L43.8874 0.0302734H40.3724L29.6644 12.4029Z" fill="#2C2C2C"/>
            <path d="M46.8901 0.0301347H44.9682L42.5977 2.73222H46.8901C48.3239 2.73222 49.699 3.30179 50.7129 4.31564C51.7267 5.32949 52.2963 6.70455 52.2963 8.13834C52.2963 9.57214 51.7267 10.9472 50.7129 11.9611C49.699 12.9749 48.3239 13.5445 46.8901 13.5445H41.484V6.71446L38.7812 9.78954V16.2472H46.8901C49.0408 16.2472 51.1034 15.3929 52.6242 13.8721C54.145 12.3513 54.9993 10.2887 54.9993 8.13802C54.9993 5.98732 54.145 3.92472 52.6242 2.40395C51.1034 0.883174 49.0408 0.0288086 46.8901 0.0288086V0.0301347Z" fill="#2C2C2C"/>
            <path d="M8.10921 13.515C6.67541 13.515 5.30034 12.9454 4.28649 11.9316C3.27264 10.9177 2.70307 9.54266 2.70307 8.10886C2.70307 6.67507 3.27264 5.3 4.28649 4.28616C5.30034 3.27231 6.67541 2.70274 8.10921 2.70274H21.29L23.6632 0H8.10921C5.95851 0 3.89591 0.854345 2.37514 2.37512C0.854366 3.89589 0 5.95851 0 8.10921C0 10.2599 0.854366 12.3225 2.37514 13.8433C3.89591 15.3641 5.95851 16.2184 8.10921 16.2184H11.7191L14.0963 13.5157L8.10921 13.515Z" fill="#2C2C2C"/>
          </svg>
        </div>
        <div className="nav-links">
          {[t.companyList, t.productList, t.folderList, t.fileList].map((link, i) => (
            <button key={i} className={`nav-link${activeNav === i ? ' active' : ''}`} onClick={() => goNav(i)}>
              {link}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <button className="lang-toggle" onClick={toggleLang}>
            <svg
              className="globe-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ position: 'relative', top: '0px', left: '0px', opacity: 1, flexShrink: 0, width: '20px', height: '20px' }}
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="lang-text">
              {lang === 'en' ? '日本語' : 'English'}
            </span>
          </button>
          <div className="nav-user">
            <div className="nav-avatar" onClick={() => setUserMenuOpen(o => !o)}>
              {user?.name ? user.name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {userMenuOpen && (
              <>
                <div className="nav-menu-backdrop" onClick={() => setUserMenuOpen(false)} />
                <div className="nav-menu">
                  <div className="nav-menu-item nav-menu-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    {user?.name || user?.email || 'User'}
                  </div>
                  <button className="nav-menu-item" onClick={() => { handleCacheClear(); setUserMenuOpen(false); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                    Cache clear
                  </button>
                  <button className="nav-menu-item nav-menu-logout" onClick={() => { handleLogout(); setUserMenuOpen(false); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="page-content">
        {renderBody()}
      </div>

      {toast && (
        <div className="toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{toast}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
