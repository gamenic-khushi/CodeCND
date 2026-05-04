import { useState, useEffect } from 'react';
import './App.css';
import translations from './translations';
import { INITIAL_FILE_ROWS, INITIAL_PR_ROWS, INITIAL_PRODUCTS, INITIAL_FOLDERS, EMPTY_FORM } from './data';

import { db, auth } from './appwrite';
import LoginPage from './pages/auth/LoginPage';
import NotificationPage  from './pages/notifications/NotificationPage';
import NewChatPage       from './pages/chat/NewChatPage';
import CompaniesPage     from './pages/companies/CompaniesPage';
import AddCompanyPage    from './pages/companies/AddCompanyPage';
import FolderDetailPage        from './pages/folders/FolderDetailPage';
import MatrixGenerationPage    from './pages/chat/MatrixGenerationPage';

const API = 'http://localhost:5000/api';

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
  const [formData, setFormData]                 = useState(EMPTY_FORM);
  const [companies, setCompanies]               = useState([
    { id: 'co0001', en: 'Company A',               jp: 'カンパニーA' },
    { id: 'co0002', en: 'Beer',                    jp: 'ビール' },
    { id: 'co0003', en: 'Kanro',                   jp: 'カンロ' },
    { id: 'co0005', en: 'Apple Inc.',              jp: 'アップル株式会社' },
    { id: 'co0006', en: 'Shiseido',                jp: '資生堂' },
    { id: 'co0007', en: 'test',                    jp: 'テスト' },
    { id: 'co0011', en: "McDonald's",              jp: 'マクドナルド' },
    { id: 'co0012', en: 'Nissan Motor Corporation', jp: '日産自動車株式会社' },
  ]);
  const [, setToast]                 = useState(null);
  const [products, setProducts]     = useState(INITIAL_PRODUCTS);
  const [folderRows, setFolderRows] = useState(INITIAL_FOLDERS);
  const [fileRows, setFileRows]     = useState(INITIAL_FILE_ROWS);
  const [prRows, setPrRows]         = useState(INITIAL_PR_ROWS);

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
    db.list('files').then(docs => { if (docs.length) setFileRows(docs); }).catch(() => {});
    db.list('pressReleases').then(docs => { if (docs.length) setPrRows(docs); }).catch(() => {});

    Promise.all([
      db.list('companies').catch(() => []),
      db.list('products').catch(() => []),
      db.list('folders').catch(() => []),
    ]).then(([companyDocs, productDocs, folderDocs]) => {
      if (companyDocs.length) setCompanies(companyDocs);

      const enrichedProducts = productDocs.map(product => {
        const company = companyDocs.find(c => c._awid === product.companyId || c.id === product.companyId);
        return { ...product, companyEn: company ? company.en : '', companyJp: company ? company.jp : '' };
      });
      if (enrichedProducts.length) setProducts(enrichedProducts);

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

  function handleSidebarNavigate(section, fromSetter) {
    fromSetter(false);
    setShowFolderDetail(false);
    setShowMatrixGen(false);
    if (section === 'notification') { setShowNotification(true); }
    else if (section === 'newChat')  { setShowNewChat(true); }
    else if (section === 'companies') { setShowCompanies(true); }
  }

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
      onNavigate={(section) => handleSidebarNavigate(section, setShowFolderDetail)}
      onBack={() => { setShowFolderDetail(false); setShowCompanies(true); }}
      onNewChat={() => { setShowFolderDetail(false); setShowNewChat(true); }}
    />
  );

  if (showAddCompany) return (
    <AddCompanyPage
      lang={lang}
      user={user}
      folderRows={folderRows}
      products={products}
      prRows={prRows}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section) => handleSidebarNavigate(section, setShowAddCompany)}
      onBack={() => { setShowAddCompany(false); setShowCompanies(true); }}
      onSave={(data) => {
        handleSaveCompany(data);
        setShowAddCompany(false);
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
      onBack={() => { setShowMatrixGen(false); setShowNewChat(true); }}
      onNavigate={(section) => handleSidebarNavigate(section, setShowMatrixGen)}
    />
  );

  if (showNewChat) return (
    <NewChatPage
      lang={lang}
      user={user}
      folders={folderRows}
      companies={companies}
      folderRows={folderRows}
      fileRows={fileRows}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onBack={() => { setShowNewChat(false); setShowNotification(true); }}
      onNavigate={(section) => handleSidebarNavigate(section, setShowNewChat)}
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

  if (showCompanies) return (
    <CompaniesPage
      lang={lang}
      user={user}
      companies={companies}
      folderRows={folderRows}
      products={products}
      onLogout={handleLogout}
      onToggleLang={toggleLang}
      onNavigate={(section) => handleSidebarNavigate(section, setShowCompanies)}
      onAddCompany={() => { setShowCompanies(false); setShowAddCompany(true); }}
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
      onNavigate={(section) => handleSidebarNavigate(section, setShowNotification)}
    />
  );

  // Fallback: redirect to notification page
  setShowNotification(true);
  return null;
}
