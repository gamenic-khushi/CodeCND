export const INITIAL_PRODUCTS = [
  { id: 'pr0001', en: 'Product A',          jp: '製品A',            companyId: 'co0001', companyEn: 'Company A', companyJp: 'カンパニーA' },
  { id: 'pr0002', en: 'sanmigbeer',         jp: 'サンミグビール',   companyId: 'co0002', companyEn: 'Beer',      companyJp: 'ビール' },
  { id: 'pr0003', en: 'ピュレグミ',         jp: 'ピュレグミ',       companyId: 'co0003', companyEn: 'カンロ',    companyJp: 'カンロ' },
  { id: 'pr0004', en: 'ホームページ制作',   jp: 'ホームページ制作', companyId: null,     companyEn: 'No Company',companyJp: '会社なし' },
  { id: 'pr0005', en: 'test1219',            jp: 'テスト1219',       companyId: 'co0001', companyEn: 'Company A', companyJp: 'カンパニーA' },
  { id: 'pr0006', en: 'sanmigbeerのコピー', jp: 'sanmigbeerのコピー',companyId: 'co0002', companyEn: 'Beer',      companyJp: 'ビール' },
  { id: 'pr0007', en: 'TSUBAKI',            jp: 'TSUBAKI',          companyId: 'co0006', companyEn: 'Shiseido',  companyJp: '資生堂' },
  { id: 'pr0008', en: 'test',               jp: 'テスト',           companyId: null,     companyEn: 'No Company',companyJp: '会社なし' },
];

export const INITIAL_FOLDERS = [
  { id: 'fo0001', en: 'FolderA',             jp: 'フォルダA',           companyEn: 'Company A',  companyJp: 'カンパニーA', productEn: 'Product A',       productJp: '製品A' },
  { id: 'fo0002', en: 'Aki Test',             jp: 'アキテスト',           companyEn: 'カンロ',      companyJp: 'カンロ',      productEn: 'ピュレグミ',       productJp: 'ピュレグミ' },
  { id: 'fo0003', en: 'AUでんき',             jp: 'AUでんき',             companyEn: 'カンロ',      companyJp: 'カンロ',      productEn: 'ピュレグミ',       productJp: 'ピュレグミ' },
  { id: 'fo0004', en: 'キャンペーン2026年春', jp: 'キャンペーン2026年春', companyEn: 'No Company', companyJp: '会社なし',    productEn: 'ホームページ制作', productJp: 'ホームページ制作' },
  { id: 'fo0005', en: 'test1219',             jp: 'テスト1219',           companyEn: 'Company A',  companyJp: 'カンパニーA', productEn: 'test1219',        productJp: 'テスト1219' },
  { id: 'fo0006', en: '2025年過去バナー',     jp: '2025年過去バナー',     companyEn: 'Shiseido',   companyJp: '資生堂',      productEn: 'TSUBAKI',         productJp: 'TSUBAKI' },
  { id: 'fo0007', en: '2026年春キャンペーン', jp: '2026年春キャンペーン', companyEn: 'Shiseido',   companyJp: '資生堂',      productEn: 'TSUBAKI',         productJp: 'TSUBAKI' },
  { id: 'fo0008', en: 'test',                 jp: 'テスト',               companyEn: 'No Company', companyJp: '会社なし',    productEn: 'test',            productJp: 'テスト' },
];

export const INITIAL_FILE_ROWS = [
  { id: 1, refId: 'fa0002', type: 'File', folderId: 'fo0001', en: 'pdfExample.pdf Copy',                  jp: 'pdfExample.pdf のコピー' },
  { id: 2, refId: 'fa0003', type: 'Chat', folderId: 'fo0001', en: 'Kitty and Pikachu Design Comparison',  jp: 'キティとピカチュウデザイン比較' },
  { id: 3, refId: 'fa0004', type: 'File', folderId: 'fo0006', en: '2025 Past Banner',                      jp: '2025年過去バナー' },
  { id: 4, refId: 'fa0005', type: 'File', folderId: 'fo0006', en: 'Instagram promotional banner design',   jp: 'Instagramプロモーションバナーデザイン' },
  { id: 5, refId: 'fa0006', type: 'File', folderId: 'fo0003', en: 'AU Shoji Collaboration Project',        jp: 'au商事コラボ企画' },
  { id: 6, refId: 'fa0007', type: 'Chat', folderId: 'fo0003', en: 'test4-1',                               jp: 'テスト4-1' },
  { id: 7, refId: 'fa0008', type: 'File', folderId: 'fo0003', en: 'AU Shoji Collaboration Project 2',      jp: 'au商事コラボ企画２' },
];

export const INITIAL_PR_ROWS = [
  { id: 1, refId: 'pe0001', date: '2026/01/22', en: 'test', jp: 'テスト' },
  { id: 2, refId: 'pe0002', date: '2026/01/22', en: 'NB Bancorp, Inc. Reports Fourth Quarter 2025 Financial Results, Declares Quarterly Cash Dividend, Announces Share Repurchase Plan', jp: 'NBバンコープ、2025年第4四半期決算発表' },
  { id: 3, refId: 'pe0003', date: '2026/01/29', en: 'Dropbox、スクラッチDJ界のレジェンド、Shortkut氏の利用事例を公開', jp: 'Dropbox、スクラッチDJ界のレジェンド、Shortkut氏の利用事例を公開' },
  { id: 4, refId: 'pe0004', date: '2026/01/23', en: 'Honda Motor Co., Ltd. Announces New Corporate Advertisement and Updates', jp: '本田技研工業株式会社、新企業広告を発表' },
  { id: 5, refId: 'pe0005', date: '2026/01/23', en: 'Honda Motor Co., Ltd. | Honda Global Corporate Site', jp: 'Honda Motor Co., Ltd. | Hondaグローバル企業サイト' },
];

export const EMPTY_FORM = {
  companyName: '', companyWebsite: '', industry: '', employees: '',
  revenueScale: '', brandConcept: '', companyCategories: '', headquartersLocation: '',
  foundingDate: '', businessActivities: '', mainProducts: '', salesScale: '',
  marketShare: '', targetCustomer: '', competitors: '', missionVision: '',
  brandStrategy: '', promotionHistory: '', swot: '', valueProposition: '',
  futureStrategy: '', notes: '',
};

export const companyProductsData = {
  'co0001': [
    { id: 101, en: 'Honey Hand Cream',      jp: 'はちみつハンドクリーム' },
    { id: 102, en: 'Product B',             jp: '製品B' },
    { id: 103, en: 'Product C',             jp: '製品C' },
  ],
  'co0002': [
    { id: 201, en: 'Craft Beer Premium',    jp: 'クラフトビールプレミアム' },
    { id: 202, en: 'Draft Beer Classic',    jp: '生ビールクラシック' },
    { id: 203, en: 'Seasonal Limited Beer', jp: '季節限定ビール' },
  ],
  'co0003': [
    { id: 301, en: 'Test Product Alpha',    jp: 'テスト製品アルファ' },
    { id: 302, en: 'Test Product Beta',     jp: 'テスト製品ベータ' },
    { id: 303, en: 'Test Product Gamma',    jp: 'テスト製品ガンマ' },
  ],
};

export const productFoldersData = {
  // Yamakamishoji — Honey Hand Cream
  101: [
    { id: 1001, en: '2025 Autumn Campaign', jp: '2025年秋キャンペーン' },
    { id: 1002, en: 'Folder Name B',        jp: 'フォルダ名B' },
    { id: 1003, en: 'Folder Name C',        jp: 'フォルダ名C' },
  ],
  // Yamakamishoji — Product B
  102: [
    { id: 1021, en: 'Spring Campaign 2025', jp: '2025年春キャンペーン' },
    { id: 1022, en: 'Summer Campaign 2025', jp: '2025年夏キャンペーン' },
    { id: 1023, en: 'Winter Campaign 2025', jp: '2025年冬キャンペーン' },
  ],
  // Yamakamishoji — Product C
  103: [
    { id: 1031, en: 'Campaign Folder A',    jp: 'キャンペーンフォルダA' },
    { id: 1032, en: 'Campaign Folder B',    jp: 'キャンペーンフォルダB' },
    { id: 1033, en: 'Campaign Folder C',    jp: 'キャンペーンフォルダC' },
  ],
  // Beer Inc. — Craft Beer Premium
  201: [
    { id: 2011, en: '2025 Summer Campaign',    jp: '2025年夏キャンペーン' },
    { id: 2012, en: 'Premium Launch Campaign', jp: 'プレミアム発売キャンペーン' },
    { id: 2013, en: 'Beer Festival 2025',      jp: 'ビールフェスティバル2025' },
  ],
  // Beer Inc. — Draft Beer Classic
  202: [
    { id: 2021, en: 'Classic Promotion 2025',  jp: 'クラシックプロモーション2025' },
    { id: 2022, en: 'Bar Campaign',            jp: 'バーキャンペーン' },
    { id: 2023, en: 'Draft Beer Event',        jp: '生ビールイベント' },
  ],
  // Beer Inc. — Seasonal Limited Beer
  203: [
    { id: 2031, en: 'Winter Limited Campaign', jp: '冬季限定キャンペーン' },
    { id: 2032, en: 'Spring Limited Campaign', jp: '春季限定キャンペーン' },
    { id: 2033, en: 'Holiday Special',         jp: 'ホリデースペシャル' },
  ],
  // Kanro — Test Product Alpha
  301: [
    { id: 3011, en: 'Alpha Test Folder 1',     jp: 'アルファテストフォルダ1' },
    { id: 3012, en: 'Alpha Test Folder 2',     jp: 'アルファテストフォルダ2' },
    { id: 3013, en: 'Alpha Test Folder 3',     jp: 'アルファテストフォルダ3' },
  ],
  // Kanro — Test Product Beta
  302: [
    { id: 3021, en: 'Beta Test Folder 1',      jp: 'ベータテストフォルダ1' },
    { id: 3022, en: 'Beta Test Folder 2',      jp: 'ベータテストフォルダ2' },
    { id: 3023, en: 'Beta Test Folder 3',      jp: 'ベータテストフォルダ3' },
  ],
  // Kanro — Test Product Gamma
  303: [
    { id: 3031, en: 'Gamma Test Folder 1',     jp: 'ガンマテストフォルダ1' },
    { id: 3032, en: 'Gamma Test Folder 2',     jp: 'ガンマテストフォルダ2' },
    { id: 3033, en: 'Gamma Test Folder 3',     jp: 'ガンマテストフォルダ3' },
  ],
};

export function getFormFields(t) {
  return [
    { key: 'companyName',          label: t.companyNameLabel, required: true },
    { key: 'companyWebsite',       label: t.companyWebsite },
    { key: 'industry',             label: t.industry },
    { key: 'employees',            label: t.employees },
    { key: 'revenueScale',         label: t.revenueScale },
    { key: 'brandConcept',         label: t.brandConcept },
    { key: 'companyCategories',    label: t.companyCategories },
    { key: 'headquartersLocation', label: t.headquartersLocation },
    { key: 'foundingDate',         label: t.foundingDate, type: 'date' },
    { key: 'businessActivities',   label: t.businessActivities },
    { key: 'mainProducts',         label: t.mainProducts },
    { key: 'salesScale',           label: t.salesScale },
    { key: 'marketShare',          label: t.marketShare },
    { key: 'targetCustomer',       label: t.targetCustomer },
    { key: 'competitors',          label: t.competitors },
    { key: 'missionVision',        label: t.missionVision },
    { key: 'brandStrategy',        label: t.brandStrategy },
    { key: 'promotionHistory',     label: t.promotionHistory },
    { key: 'swot',                 label: t.swot },
    { key: 'valueProposition',     label: t.valueProposition },
    { key: 'futureStrategy',       label: t.futureStrategy },
    { key: 'notes',                label: t.notes, textarea: true },
  ];
}
