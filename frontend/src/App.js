import { useState, useEffect } from 'react';
import './App.css';
import translations from './translations';
import { INITIAL_FILE_ROWS, INITIAL_PR_ROWS, INITIAL_PRODUCTS, INITIAL_FOLDERS, EMPTY_FORM } from './data';

import { db, auth, fn } from './appwrite';
import LoginPage from './pages/auth/LoginPage';
import NotificationPage  from './pages/notifications/NotificationPage';
import NewChatPage       from './pages/chat/NewChatPage';
import CompaniesPage     from './pages/companies/CompaniesPage';
import AddCompanyPage    from './pages/companies/AddCompanyPage';
import AddProductPage    from './pages/companies/AddProductPage';
import FolderDetailPage        from './pages/folders/FolderDetailPage';
import FoldersPage             from './pages/folders/FoldersPage';
import MatrixGenerationPage    from './pages/chat/MatrixGenerationPage';
import AddFilePage             from './pages/files/AddFilePage';


export default function App() {
  const [user, setUser] = useState(null);

  async function handleLogout() {
    await auth.logout().catch(() => {});
    localStorage.removeItem('cnd_logged_in');
    setUser(null);
  }

  const [lang, setLang]                         = useState('en');
  const [showNotification, setShowNotification] = useState(true);
  const [showNewChat, setShowNewChat]           = useState(false);
  const [showCompanies, setShowCompanies]       = useState(false);
  const [showAddCompany, setShowAddCompany]     = useState(false);
  const [showFolderDetail, setShowFolderDetail]     = useState(false);
  const [showMatrixGen,    setShowMatrixGen]         = useState(false);
  const [selectedFolderDetail, setSelectedFolderDetail] = useState(null);
  const [newChatInitFolder,    setNewChatInitFolder]    = useState(null);
  const [newChatInitName,      setNewChatInitName]      = useState('');
  const [showAddFile,          setShowAddFile]          = useState(false);
  const [addFileInitFolder,    setAddFileInitFolder]    = useState(null);
  const [matrixData,           setMatrixData]           = useState({});
  const [matrixGenFolder,      setMatrixGenFolder]      = useState(null);
  const [companiesInitCompany, setCompaniesInitCompany] = useState(null);
  const [showFolders,          setShowFolders]          = useState(false);
  const [foldersInitCompany,   setFoldersInitCompany]   = useState(null);
  const [foldersInitProduct,   setFoldersInitProduct]   = useState(null);
  const [showAddProduct,       setShowAddProduct]       = useState(false);
  const [addProductInitCompany, setAddProductInitCompany] = useState(null);
  const [formData, setFormData]                 = useState(EMPTY_FORM);
  const [companies, setCompanies]               = useState([]);
  const [, setToast]                 = useState(null);
  const [products, setProducts]     = useState([]);
  const [folderRows, setFolderRows] = useState([]);
  const [fileRows, setFileRows]     = useState([]);
  const [prRows, setPrRows]         = useState([]);

  const t = translations[lang];

  async function toggleLang() {
    const next = lang === 'en' ? 'jp' : 'en';
    setLang(next);
    if (next !== 'jp') return;

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

  useEffect(() => { document.documentElement.lang = lang === 'jp' ? 'ja' : 'en'; }, [lang]);

  // Load all collections from Appwrite once the user is authenticated
  useEffect(() => {
    if (!user) return;
    db.list('files').then(docs => setFileRows(docs)).catch(() => {});
    db.list('pressReleases').then(docs => setPrRows(docs)).catch(() => {});

    Promise.all([
      db.list('companies').catch(() => []),
      db.list('products').catch(() => []),
      db.list('folders').catch(() => []),
    ]).then(([companyDocs, productDocs, folderDocs]) => {
      setCompanies(companyDocs);

      const enrichedProducts = productDocs.map(product => {
        const company = companyDocs.find(c => c._awid === product.companyId || c.id === product.companyId);
        return {
          ...product,
          companyEn: company ? company.en : (product.companyEn || ''),
          companyJp: company ? company.jp : (product.companyJp || ''),
        };
      });
      setProducts(enrichedProducts);

      const enrichedFolders = folderDocs.map(folder => {
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
      setFolderRows(enrichedFolders);
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function dbErr(err) { setToast('⚠ ' + (err?.message || 'Save failed')); console.error(err); }

  async function translateToJp(texts) {
    try {
      const d = await fn.call('/translate', { texts });
      return d.translated || null;
    } catch { return null; }
  }

  async function handleSaveCompany(overrideData) {
    const data = overrideData || formData;
    const name = (data.companyName || '').trim() || `Company ${companies.length + 1}`;
    const nums = companies.map(c => parseInt(c.id.replace('co', '')) || 0);
    const nextNum = Math.max(0, ...nums) + 1;
    const newId = `co${String(nextNum).padStart(4, '0')}`;
    const newCompany = { id: newId, en: name, jp: name };
    setCompanies(prev => [...prev, newCompany]);
    setFormData(EMPTY_FORM);
    translateToJp([name]).then(translated => {
      if (translated?.[0]) {
        const jp = translated[0];
        setCompanies(prev => prev.map(c => c.id === newId ? { ...c, jp } : c));
        db.create('companies', { ...newCompany, jp, ...data })
          .then(saved => setCompanies(prev => prev.map(c => c.id === newId ? { ...c, _awid: saved._awid } : c)))
          .catch(dbErr);
      } else {
        db.create('companies', { ...newCompany, ...data })
          .then(saved => setCompanies(prev => prev.map(c => c.id === newId ? { ...c, _awid: saved._awid } : c)))
          .catch(dbErr);
      }
    });
  }

  if (!user) return <LoginPage onLogin={u => { setUser(u); setShowNotification(true); }} />;

  function handleSidebarNavigate(section, fromSetter, data) {
    fromSetter(false);
    setShowFolderDetail(false);
    setShowMatrixGen(false);
    setShowAddFile(false);
    setShowFolders(false);
    if (section === 'notification') { setShowNotification(true); }
    else if (section === 'newChat')  { setShowNewChat(true); }
    else if (section === 'companies') {
      setCompaniesInitCompany(data || null);
      setShowCompanies(true);
    } else if (section === 'folders') {
      setFoldersInitCompany(data?.company || null);
      setFoldersInitProduct(data?.product || null);
      setShowFolders(true);
    }
  }

  if (showAddFile) return (
    <AddFilePage
      lang={lang}
      user={user}
      folderRows={folderRows}
      companies={companies}
      products={products}
      fileRows={fileRows}
      initialFolder={addFileInitFolder}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowAddFile, data)}
      onBack={() => {
        setShowAddFile(false);
        if (addFileInitFolder) {
          setSelectedFolderDetail(addFileInitFolder);
          setShowFolderDetail(true);
          setAddFileInitFolder(null);
        } else {
          setShowNotification(true);
        }
      }}
      onOpenFile={(f) => {
        const parentFolder = folderRows.find(fr => fr._awid === f.folderId || fr.id === f.folderId);
        setNewChatInitFolder(parentFolder || null);
        setNewChatInitName(lang === 'en' ? f.en : (f.jp || f.en));
        setShowAddFile(false);
        setShowNewChat(true);
      }}
      onUpload={({ folderId, files }) => {
        files.forEach(file => {
          const nums = fileRows.map(f => parseInt((f.refId || '').replace('fa', '')) || 0);
          const nextNum = Math.max(0, ...nums) + 1;
          const thumbnailUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
          const newFile = {
            id: Date.now() + Math.random(),
            refId: `fa${String(nextNum).padStart(4, '0')}`,
            type: 'File',
            folderId: folderId || '',
            en: file.name,
            jp: file.name,
            thumbnailUrl,
            savedAt: new Date().toISOString(),
          };
          setFileRows(prev => [newFile, ...prev]);
          db.create('files', newFile).catch(dbErr);
        });
        setShowAddFile(false);
        if (addFileInitFolder) {
          setSelectedFolderDetail(addFileInitFolder);
          setShowFolderDetail(true);
          setAddFileInitFolder(null);
        } else {
          setShowNotification(true);
        }
      }}
    />
  );

  if (showFolderDetail && selectedFolderDetail) return (
    <FolderDetailPage
      lang={lang}
      user={user}
      folder={selectedFolderDetail}
      fileRows={fileRows}
      folderRows={folderRows}
      companies={companies}
      products={products}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowFolderDetail, data)}
      onBack={() => { setShowFolderDetail(false); setShowCompanies(true); }}
      matrixData={matrixData[selectedFolderDetail?._awid || selectedFolderDetail?.id] || {}}
      onNewChat={() => { setNewChatInitFolder(selectedFolderDetail); setShowFolderDetail(false); setShowNewChat(true); }}
      onAddFile={() => { setAddFileInitFolder(selectedFolderDetail); setShowFolderDetail(false); setShowAddFile(true); }}
      onOpenMatrix={() => { setMatrixGenFolder(selectedFolderDetail); setShowFolderDetail(false); setShowMatrixGen(true); }}
      onOpenFolder={(f) => { setSelectedFolderDetail(f); }}
      onOpenFile={(f) => {
        const parentFolder = folderRows.find(fr => fr._awid === f.folderId || fr.id === f.folderId) || selectedFolderDetail;
        setNewChatInitFolder(parentFolder);
        setNewChatInitName(lang === 'en' ? f.en : (f.jp || f.en));
        setShowFolderDetail(false);
        setShowNewChat(true);
      }}
    />
  );

  if (showAddCompany) return (
    <AddCompanyPage
      lang={lang}
      user={user}
      companies={companies}
      folderRows={folderRows}
      fileRows={fileRows}
      products={products}
      prRows={prRows}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowAddCompany, data)}
      onCreateFolder={({ name, productId }) => {
        const product = products.find(p => (p._awid || p.id) === productId);
        const newId = `local-${Date.now()}`;
        const newFolder = { id: newId, en: name, jp: name, productId: productId || '', companyEn: product?.companyEn || '', companyJp: product?.companyJp || '', productEn: product?.en || '', productJp: product?.jp || '' };
        setFolderRows(prev => [newFolder, ...prev]);
        db.create('folders', newFolder).then(saved => setFolderRows(prev => prev.map(f => f.id === newId ? { ...f, _awid: saved._awid } : f))).catch(dbErr);
      }}
      onBack={() => { setShowAddCompany(false); setShowCompanies(true); }}
      onSave={(data) => {
        handleSaveCompany(data);
        setShowAddCompany(false);
        setShowCompanies(true);
      }}
      onDeletePR={(id, awid) => {
        setPrRows(prev => prev.filter(p => p.id !== id));
        if (awid) db.delete('pressReleases', awid).catch(dbErr);
      }}
      onUpdatePR={(updated) => {
        setPrRows(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (updated._awid) {
          const { _awid, ...rest } = updated;
          db.update('pressReleases', _awid, rest).catch(dbErr);
        }
      }}
      onSavePR={(prData) => {
        const nextNum = (prRows.length + 1).toString().padStart(4, '0');
        const newId = `local-pr-${Date.now()}`;
        const newPR = {
          id: newId,
          refId: `pe${nextNum}`,
          en: prData.titleEn || prData.title || '',
          jp: prData.titleJp || prData.title || '',
          date: prData.date || new Date().toISOString().slice(0, 10),
          body: prData.body || '',
          url: prData.url || '',
        };
        setPrRows(prev => [newPR, ...prev]);
        db.create('pressReleases', newPR)
          .then(saved => setPrRows(prev => prev.map(p => p.id === newId ? { ...p, _awid: saved._awid } : p)))
          .catch(dbErr);
      }}
    />
  );

  if (showAddProduct) return (
    <AddProductPage
      lang={lang}
      user={user}
      companies={companies}
      products={products}
      folderRows={folderRows}
      fileRows={fileRows}
      initialCompany={addProductInitCompany}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowAddProduct, data)}
      onBack={() => { setShowAddProduct(false); setCompaniesInitCompany(addProductInitCompany); setShowCompanies(true); }}
      onSave={(data) => {
        const nums = products.map(p => parseInt((p.id || '').replace('pr', '')) || 0);
        const newId = `pr${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const company = data.companyRef || companies.find(c => c.en === data.company || c.jp === data.company);
        const newProduct = {
          id: newId,
          en: data.product,
          jp: data.product,
          companyId: company?._awid || company?.id || '',
          companyEn: company?.en || data.company || '',
          companyJp: company?.jp || data.company || '',
          websiteUrl: data.websiteUrl,
          industry: data.industry,
          employees: data.employees,
          revenueScale: data.revenueScale,
          brandConcept: data.brandConcept,
          releaseDate: data.releaseDate,
          price: data.price,
          targetCustomers: data.targetCustomers,
          differentiationPoints: data.differentiationPoints,
          productSpecifications: data.productSpecifications,
          brandStrategy: data.brandStrategy,
          usageScenes: data.usageScenes,
          customerInsight: data.customerInsight,
          priceJustification: data.priceJustification,
          salesScale: data.salesScale,
          costStructure: data.costStructure,
          pastPromotion: data.pastPromotion,
          salesChannels: data.salesChannels,
          swotAnalysis: data.swotAnalysis,
          futureOutlook: data.futureOutlook,
          notes: data.notes,
        };
        setProducts(prev => [newProduct, ...prev]);
        db.create('products', newProduct)
          .then(saved => setProducts(prev => prev.map(p => p.id === newId ? { ...p, _awid: saved._awid } : p)))
          .catch(dbErr);
        setShowAddProduct(false);
        setCompaniesInitCompany(addProductInitCompany);
        setShowCompanies(true);
      }}
    />
  );

  if (showMatrixGen) return (
    <MatrixGenerationPage
      lang={lang}
      user={user}
      folderRows={folderRows}
      companies={companies}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onBack={() => {
        setShowMatrixGen(false);
        if (matrixGenFolder) {
          setSelectedFolderDetail(matrixGenFolder);
          setShowFolderDetail(true);
        } else {
          setShowNewChat(true);
        }
      }}
      fileRows={fileRows}
      onOpenFile={(f) => {
        const parentFolder = folderRows.find(fr => fr._awid === f.folderId || fr.id === f.folderId);
        setNewChatInitFolder(parentFolder || null);
        setNewChatInitName(lang === 'en' ? f.en : (f.jp || f.en));
        setShowMatrixGen(false);
        setShowNewChat(true);
      }}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowMatrixGen, data)}
      onSaveMatrix={(outputs, prompts) => {
        const folderId = matrixGenFolder?._awid || matrixGenFolder?.id;
        if (!folderId) return;
        const ts = new Date().toISOString();
        const results = Object.entries(outputs).reduce((acc, [id, output]) => ({
          ...acc,
          [id]: { output, prompt: prompts[id] || '', generatedAt: ts },
        }), {});
        setMatrixData(prev => ({ ...prev, [folderId]: { ...(prev[folderId] || {}), ...results } }));
      }}
    />
  );

  if (showNewChat) return (
    <NewChatPage
      lang={lang}
      user={user}
      folders={folderRows}
      companies={companies}
      products={products}
      folderRows={folderRows}
      fileRows={fileRows}
      initialFolder={newChatInitFolder}
      initialName={newChatInitName}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onBack={() => {
        if (newChatInitFolder) {
          setSelectedFolderDetail(newChatInitFolder);
          setShowNewChat(false);
          setShowFolderDetail(true);
          setNewChatInitFolder(null);
          setNewChatInitName('');
        } else {
          setNewChatInitFolder(null);
          setNewChatInitName('');
          setShowNewChat(false);
          setShowNotification(true);
        }
      }}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowNewChat, data)}
      onSave={(data) => {
        const nums = fileRows.map(f => parseInt((f.refId || '').replace('fa', '')) || 0);
        const nextNum = Math.max(0, ...nums) + 1;
        const newFile = {
          id: Date.now(),
          refId: `fa${String(nextNum).padStart(4, '0')}`,
          type: 'Chat',
          folderId: data.selectedFolder || '',
          en: data.name,
          jp: data.name,
          prompt: data.prompt || '',
          savedAt: new Date().toISOString(),
        };
        setFileRows(prev => [newFile, ...prev]);
        db.create('files', newFile).catch(dbErr);
        setShowNewChat(false);
        setShowNotification(true);
      }}
      onMatrixGenerate={() => { setShowNewChat(false); setShowMatrixGen(true); }}
      onCreateFolder={({ name, productId }) => {
        const nums = folderRows.map(f => parseInt((f.id || '').replace('fo', '')) || 0);
        const newId = `fo${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const product = products.find(p => (p._awid || p.id) === productId);
        const newFolder = {
          id: newId, en: name, jp: name, productId: productId || '',
          companyEn: product?.companyEn || '', companyJp: product?.companyJp || '',
          productEn: product?.en || '', productJp: product?.jp || '',
        };
        setFolderRows(prev => [newFolder, ...prev]);
        db.create('folders', newFolder)
          .then(saved => setFolderRows(prev => prev.map(f => f.id === newId ? { ...f, _awid: saved._awid } : f)))
          .catch(dbErr);
      }}
    />
  );

  if (showFolders) return (
    <FoldersPage
      lang={lang}
      user={user}
      companies={companies}
      products={products}
      folderRows={folderRows}
      fileRows={fileRows}
      initialCompany={foldersInitCompany}
      initialProduct={foldersInitProduct}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowFolders, data)}
      onOpenFolder={(f) => { setSelectedFolderDetail(f); setShowFolders(false); setShowFolderDetail(true); }}
      onCreateFolder={({ name, productId }) => {
        const nums = folderRows.map(f => parseInt((f.id || '').replace('fo', '')) || 0);
        const newId = `fo${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const product = products.find(p => (p._awid || p.id) === productId);
        const newFolder = { id: newId, en: name, jp: name, productId: productId || '', companyEn: product?.companyEn || '', companyJp: product?.companyJp || '', productEn: product?.en || '', productJp: product?.jp || '' };
        setFolderRows(prev => [newFolder, ...prev]);
        setShowFolders(false); setSelectedFolderDetail(newFolder); setShowFolderDetail(true);
        db.create('folders', newFolder).then(saved => { const w = { ...newFolder, _awid: saved._awid }; setFolderRows(prev => prev.map(f => f.id === newId ? w : f)); setSelectedFolderDetail(w); }).catch(dbErr);
      }}
      onDeleteFolder={(id) => { const t = folderRows.find(f => f.id === id); setFolderRows(prev => prev.filter(f => f.id !== id)); if (t?._awid) db.delete('folders', t._awid).catch(dbErr); }}
      onEditFolder={(updated) => { setFolderRows(prev => prev.map(f => f.id === updated.id ? updated : f)); if (updated._awid) { const { _awid, ...d } = updated; db.update('folders', _awid, d).catch(dbErr); } }}
      onDuplicateFolder={(f) => {
        const nums = folderRows.map(x => parseInt((x.id || '').replace('fo', '')) || 0);
        const newId = `fo${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const { _awid: _, ...rest } = f;
        const dupe = { ...rest, id: newId, en: f.en + ' Copy', jp: (f.jp || f.en) + ' のコピー' };
        setFolderRows(prev => [dupe, ...prev]);
        db.create('folders', dupe).then(saved => setFolderRows(prev => prev.map(x => x.id === newId ? { ...x, _awid: saved._awid } : x))).catch(dbErr);
      }}
      onAddFile={() => { setAddFileInitFolder(null); setShowFolders(false); setShowAddFile(true); }}
    />
  );

  if (showCompanies) return (
    <CompaniesPage
      lang={lang}
      user={user}
      companies={companies}
      folderRows={folderRows}
      products={products}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      initialCompany={companiesInitCompany}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowCompanies, data)}
      onAddCompany={() => { setShowCompanies(false); setShowAddCompany(true); }}
      onAddProduct={(company) => { setAddProductInitCompany(company || null); setShowCompanies(false); setShowAddProduct(true); }}
      onViewCompany={() => {}}
      onCreateFolder={({ name, productId }) => {
        const nums = folderRows.map(f => parseInt((f.id || '').replace('fo', '')) || 0);
        const newId = `fo${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const product = products.find(p => (p._awid || p.id) === productId);
        const newFolder = {
          id: newId, en: name, jp: name, productId: productId || '',
          companyEn: product?.companyEn || '', companyJp: product?.companyJp || '',
          productEn: product?.en || '', productJp: product?.jp || '',
        };
        setFolderRows(prev => [...prev, newFolder]);
        setShowCompanies(false);
        setSelectedFolderDetail(newFolder);
        setShowFolderDetail(true);
        db.create('folders', newFolder)
          .then(saved => {
            const withAwid = { ...newFolder, _awid: saved._awid };
            setFolderRows(prev => prev.map(f => f.id === newId ? withAwid : f));
            setSelectedFolderDetail(withAwid);
          })
          .catch(dbErr);
      }}
      onEditCompany={(updated) => {
        const saved = { ...updated, en: updated.companyName || updated.en, jp: updated.companyName || updated.jp };
        setCompanies(prev => prev.map(c => c.id === saved.id ? saved : c));
        setToast(t.updated);
        setTimeout(() => setToast(null), 3000);
        if (saved._awid) { const { _awid, ...d } = saved; db.update('companies', _awid, d).catch(dbErr); }
      }}
      onDeleteCompany={(id) => {
        const idSet = new Set(Array.isArray(id) ? id : [id]);
        const toDelete = companies.filter(c => idSet.has(c.id));
        setCompanies(prev => prev.filter(c => !idSet.has(c.id)));
        toDelete.forEach(c => { if (c._awid) db.delete('companies', c._awid).catch(dbErr); });
      }}
      onDuplicateCompany={(c) => {
        const nums = companies.map(x => parseInt(x.id.replace('co', '')) || 0);
        const newId = `co${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const { _awid: _, ...rest } = c;
        const dupe = { ...rest, id: newId, en: c.en + ' Copy', jp: c.jp + ' のコピー' };
        setCompanies(prev => [dupe, ...prev]);
        db.create('companies', dupe)
          .then(saved => setCompanies(prev => prev.map(x => x.id === newId ? { ...x, _awid: saved._awid } : x)))
          .catch(dbErr);
      }}
      onEditProduct={(updated) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (updated._awid) { const { _awid, ...d } = updated; db.update('products', _awid, d).catch(dbErr); }
      }}
      onDeleteProduct={(id) => {
        const toDelete = products.find(p => p.id === id);
        setProducts(prev => prev.filter(p => p.id !== id));
        if (toDelete?._awid) db.delete('products', toDelete._awid).catch(dbErr);
      }}
      onDuplicateProduct={(p) => {
        const nums = products.map(x => parseInt((x.id || '').replace('pr', '')) || 0);
        const newId = `pr${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const { _awid: _, ...rest } = p;
        const dupe = { ...rest, id: newId, en: p.en + ' Copy', jp: (p.jp || p.en) + ' のコピー' };
        setProducts(prev => [dupe, ...prev]);
        db.create('products', dupe)
          .then(saved => setProducts(prev => prev.map(x => x.id === newId ? { ...x, _awid: saved._awid } : x)))
          .catch(dbErr);
      }}
    />
  );

  if (showNotification) return (
    <NotificationPage
      lang={lang}
      user={user}
      companies={companies}
      folderRows={folderRows}
      fileRows={fileRows}
      products={products}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNewChat={() => { setShowNotification(false); setShowNewChat(true); }}
      onCreateFolder={({ name, productId }) => {
        const nums = folderRows.map(f => parseInt((f.id || '').replace('fo', '')) || 0);
        const newId = `fo${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
        const product = products.find(p => (p._awid || p.id) === productId);
        const newFolder = {
          id: newId, en: name, jp: name, productId: productId || '',
          companyEn: product?.companyEn || '', companyJp: product?.companyJp || '',
          productEn: product?.en || '', productJp: product?.jp || '',
        };
        setFolderRows(prev => [...prev, newFolder]);
        setShowNotification(false);
        setSelectedFolderDetail(newFolder);
        setShowFolderDetail(true);
        db.create('folders', newFolder)
          .then(saved => {
            const withAwid = { ...newFolder, _awid: saved._awid };
            setFolderRows(prev => prev.map(f => f.id === newId ? withAwid : f));
            setSelectedFolderDetail(withAwid);
          })
          .catch(dbErr);
      }}
      onNewFolder={() => { setShowNotification(false); setShowCompanies(false); setShowNotification(true); }}
      onNavigate={(section, data) => handleSidebarNavigate(section, setShowNotification, data)}
      onOpenFolder={(f) => {
        setSelectedFolderDetail(f);
        setShowNotification(false);
        setShowFolderDetail(true);
      }}
      onOpenFile={(f) => {
        const parentFolder = folderRows.find(fr => fr._awid === f.folderId || fr.id === f.folderId);
        setNewChatInitFolder(parentFolder || null);
        setNewChatInitName(lang === 'en' ? f.en : (f.jp || f.en));
        setShowNotification(false);
        setShowNewChat(true);
      }}
    />
  );

  // Fallback: redirect to notification page
  setShowNotification(true);
  return null;
}
