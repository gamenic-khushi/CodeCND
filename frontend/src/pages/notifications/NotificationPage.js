import translations from '../../translations';
import Sidebar from '../../components/Sidebar';
import './NotificationPage.css';
import '../../components/modals.css';

const UPDATES = [
  {
    version: 'v1.2.0', date: '2026-03-20',
    en: { title: 'Folder Management Improvements',   desc: 'Added folder sorting, search filters, and batch operations. UI responsiveness has also been improved.' },
    jp: { title: 'フォルダ管理の改善',                 desc: 'フォルダの並び替え、検索フィルタ、一括操作を追加しました。UIのレスポンシブ性も改善されました。' },
  },
  {
    version: 'v1.1.2', date: '2026-03-15',
    en: { title: 'Performance Optimization',         desc: 'Improved loading speed of company and product lists by 40%.' },
    jp: { title: 'パフォーマンス最適化',               desc: '企業・プロダクト一覧の読み込み速度を40%改善しました。' },
  },
  {
    version: 'v1.1.0', date: '2026-03-08',
    en: { title: 'Company Data Export',              desc: 'Company data can now be exported in CSV and Excel formats.' },
    jp: { title: '企業データのエクスポート',            desc: '企業データをCSVおよびExcel形式でエクスポートできるようになりました。' },
  },
  {
    version: 'v1.0.1', date: '2026-03-01',
    en: { title: 'Bug Fixes and UI Adjustments',     desc: 'Fixed sidebar display issues and improved modal responsiveness.' },
    jp: { title: 'バグ修正とUI調整',                   desc: 'サイドバーの表示問題を修正し、モーダルのレスポンシブ性を改善しました。' },
  },
];

export default function NotificationPage({ lang, user, folderRows, fileRows, products, companies, onNavigate, onLogout, onNewChat, onCreateFolder, onToggleLang, onOpenFolder, onOpenFile }) {
  const t = translations[lang];


  return (
    <div className="np-layout">

      {/* ── Sidebar ── */}
      <Sidebar
        activePage="notification"
        lang={lang}
        user={user}
        companies={companies}
        products={products}
        folderRows={folderRows}
        fileRows={fileRows}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onToggleLang={onToggleLang}
        onOpenFolder={onOpenFolder}
        onOpenFile={onOpenFile}
        onCreateFolder={onCreateFolder}
      />

      {/* ── Main content ── */}
      <main className="np-main">
        <div className="np-main-header">
          <h1 className="np-main-title">{t.notification}</h1>
        </div>

        <div className="np-content">
          <div className="np-update-section">
            <h2 className="np-update-title">{t.updateHistory}</h2>
            <p className="np-update-subtitle">{t.updateSubtitle}</p>

            <div className="np-cards">
              {UPDATES.map((u, i) => (
                <div key={i} className="np-card">
                  <div className="np-card-top">
                    <span className="np-version-badge">{u.version}</span>
                    <span className="np-card-date">{u.date}</span>
                  </div>
                  <div className="np-card-title">{lang === 'en' ? u.en.title : u.jp.title}</div>
                  <div className="np-card-desc">{lang === 'en' ? u.en.desc : u.jp.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
