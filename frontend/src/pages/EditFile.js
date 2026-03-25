import { useState } from 'react';

const SAMPLE_OUTPUT_JP = `## 比較分析レポート

### 概要
ピュレグミのハローキティデザインとピカチュウデザインの比較分析を行いました。

### デザイン要素

- **カラーパレット**: キティは白・ピンク系、ピカチュウは黄色・赤系
- **ターゲット層**: 両デザインとも幅広い年齢層を対象としているが、キティは特に女性向け、ピカチュウは子供から大人まで
- **ブランドコラボ効果**: どちらも強力なIPを活用しており、購買意欲を高める効果が期待できる

### 市場分析

ハローキティコラボは過去のデータから安定した売上増加が見込まれます。一方、ピカチュウコラボは近年のポケモンブームにより、より広いリーチが期待できます。

### プロモーション戦略

- SNSキャンペーンの活用
- 限定パッケージによる希少性の演出
- コレクター向けの特典展開

### 結論

両デザインとも市場での訴求力は高く、季節やターゲットに応じた展開が推奨されます。特にSNS映えを意識したビジュアル戦略が重要です。`;

const SAMPLE_OUTPUT_EN = `## Comparative Analysis Report

### Overview
A comparative analysis was conducted between the Hello Kitty design and the Pikachu design for Pureグミ.

### Design Elements

- **Color Palette**: Kitty uses white and pink tones; Pikachu uses yellow and red tones
- **Target Audience**: Both designs target a wide age range, but Kitty skews female while Pikachu spans children to adults
- **Brand Collab Effect**: Both leverage strong IP to boost purchase intent

### Market Analysis

The Hello Kitty collaboration is expected to deliver steady sales growth based on historical data. The Pikachu collaboration, driven by the recent Pokémon boom, is expected to reach a wider audience.

### Promotion Strategy

- Utilize SNS campaigns
- Create scarcity through limited-edition packaging
- Roll out collector-focused benefits

### Conclusion

Both designs have strong market appeal. A seasonal and target-specific rollout is recommended, with emphasis on visually striking SNS-friendly content.`;

export default function EditFile({ lang, t, file, folder, folders, onBack, onSave }) {
  const [selectedFolder, setSelectedFolder] = useState(folder?.en || folder?.jp || '');
  const [fileName, setFileName]             = useState(lang === 'en' ? (file?.en || '') : (file?.jp || ''));
  const [prompt, setPrompt]                 = useState(
    `$fa0014$ ピュレグミ＿ハローキティ.jpeg$\nhttps://test.com\n\n$fa0015$ ピュレグミ＿ピカチュウ.jpeg$\n\n比較`
  );
  const [chatText, setChatText]   = useState('');
  const output = lang === 'en' ? SAMPLE_OUTPUT_EN : SAMPLE_OUTPUT_JP;
  const [page]                    = useState(1);
  const [totalPages]              = useState(1);
  const [generating, setGenerating]   = useState(false);
  const [logsOpen, setLogsOpen]       = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  function openLogs() {
    setLogsOpen(true);
    setLogsLoading(true);
    setTimeout(() => setLogsLoading(false), 1500);
  }

  const folderList = folders && folders.length > 0
    ? folders
    : (folder ? [folder] : []);

  function handleSave() {
    if (onSave) onSave({ fileName, selectedFolder, prompt });
  }

  return (
    <div className="ef2-page">

      {/* ── Header ── */}
      <div className="ef2-header">
        <button className="ef2-back-btn" onClick={onBack}>← {t.backBtn}</button>
        <span className="ef2-title">{t.editFile}</span>
      </div>

      {/* ── Two-panel body ── */}
      <div className="ef2-body">

        {/* LEFT PANEL */}
        <div className="ef2-left">

          {/* Folder */}
          <div className="ef2-field">
            <label className="ef2-label">
              {t.folder} <span className="ef2-required">*</span>
            </label>
            <select
              className="ef2-select"
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
            >
              {folderList.map((f, i) => (
                <option key={i} value={lang === 'en' ? f.en : f.jp}>
                  {lang === 'en' ? f.en : f.jp}
                </option>
              ))}
              {folderList.length === 0 && (
                <option value="FolderA">FolderA</option>
              )}
            </select>
          </div>

          {/* Name */}
          <div className="ef2-field">
            <label className="ef2-label">{t.name}</label>
            <input
              className="ef2-input"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
            />
          </div>

          {/* Prompt */}
          <div className="ef2-field ef2-field-grow">
            <div className="ef2-prompt-header">
              <label className="ef2-label">{t.prompt}</label>
              <button className="ef2-logs-btn" onClick={openLogs}>{t.generatedLogs}</button>
            </div>
            <textarea
              className="ef2-prompt-textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="ef2-right">

          {/* Scrollable content */}
          <div className="ef2-output-scroll">
            <pre className="ef2-output-text">{output}</pre>
            <div className="ef2-output-divider" />
            <button
              className="ef2-copy-btn"
              title="Copy"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            {generating && (
              <div className="ef2-loading-dots">
                <span /><span /><span />
              </div>
            )}
            <div style={{ height: '60px' }} />
          </div>

          {/* Pagination row */}
          <div className="ef2-pagination">
            <div className="ef2-arrows">
              <button className="ef2-arrow-btn" disabled>▲</button>
              <button className="ef2-arrow-btn" disabled>▼</button>
            </div>
            <span className="ef2-page-info">{page} / {totalPages}</span>
            <button className="ef2-robot-btn">🐱</button>
          </div>

          {/* Chat section */}
          <div className="ef2-chat-section">
            <label className="ef2-chat-label">{t.chat}</label>
            <textarea
              className="ef2-chat-textarea"
              placeholder="Type follow-up revision or chat here..."
              value={chatText}
              onChange={e => setChatText(e.target.value)}
            />
          </div>

          {/* Bottom actions */}
          <div className="ef2-actions">
            {generating ? (
              <button className="ef2-stop-btn" onClick={() => setGenerating(false)}>
                <span className="ef2-stop-icon">■</span>
                Stop Generation
              </button>
            ) : (
              <button className="ef2-regenerate-btn" onClick={() => setGenerating(true)}>
                Regenerate
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Save button outside both panels */}
      <div className="ef2-footer">
        <button className="ef2-footer-save-btn" onClick={handleSave}>{t.save}</button>
      </div>

      {/* Generated Logs Modal */}
      {logsOpen && (
        <div className="ef2-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setLogsOpen(false); }}>
          <div className="ef2-modal-container">

            <div className="ef2-modal-header">
              <h2 className="ef2-modal-title">View Document Generation Logs - current_document</h2>
              <button className="ef2-modal-close" onClick={() => setLogsOpen(false)}>✕</button>
            </div>

            <div className="ef2-modal-body">
              {logsLoading ? (
                <div className="ef2-modal-loading">
                  <span /><span /><span />
                </div>
              ) : (
                <div className="ef2-modal-content-inner">

                  {/* Chat entry */}
                  <div className="ef2-log-entry">
                    <div className="ef2-log-header">
                      <span className="ef2-log-icon">💬</span>
                      <span className="ef2-log-label">Chat&nbsp;&nbsp;3/24/2026, 11:22:39 AM</span>
                    </div>
                    <div className="ef2-log-body">
                      <pre>{lang === 'en' ? 'please analyze the jpeg' : 'jpegを分析してください'}</pre>
                    </div>
                  </div>

                  {/* Result entry */}
                  <div className="ef2-log-entry">
                    <div className="ef2-log-header">
                      <span className="ef2-log-icon">📄</span>
                      <span className="ef2-log-label">Result&nbsp;&nbsp;3/24/2026, 11:22:17 AM</span>
                    </div>
                    <div className="ef2-log-body">
                      <pre>{lang === 'en' ? `Below is a comparison of the two references, based on
the images $fa0014$ and $fa0015$.

---

## 1. Brand / Character Focus

- **$fa0014$**
  - Uses a cat character with a red bow and simple
    facial features.
  - Visual identity: classic, nostalgic, "kawaii"
    (cute) style.
  - Message text: "Hello TOKIMEKI" – "tokimeki"
    implies excitement / heart-fluttering feeling.

- **$fa0015$**
  - Uses a yellow mouse-like character with long ears
    and red cheeks.
  - Visual identity: energetic, playful, strongly
    associated with games/anime.
  - Multiple facial expressions and accessories
    (hat, sunglasses, etc.) add variety and
    personality.

**Comparison:**
$fa0014$ leans toward a sweet, nostalgic, girly
cuteness; $fa0015$ leans toward playful, energetic,
and character-driven fun with more expression
variation.

---

## 2. Product & Packaging

Both appear to be the same candy brand ("Pure"
gummies), but with different character collaborations.

- **Common points**
  - Stand-up pouches.
  - Bright, saturated colors.
  - Character face dominates the front.
  - Small fruit or candy illustrations around the
    character.
  - Likely limited-edition collaboration designs.

- **Differences**
  - **$fa0014$**:
    - Red is the dominant color across all packs.
    - Layout is more uniform; each pack looks similar
      with small pose variations.
    - Background props: apple, shoes, cloth, etc.,
      giving a lifestyle / fashion feel.
  - **$fa0015$**:
    - Each pack has a different background color
      (pink, blue, green, yellow, etc.).
    - Stronger differentiation by flavor or mood via
      color and facial expression.
    - Background is a clean two-tone (blue and light
      blue) with scattered candies, giving a fresh,
      modern look.` : `以下は、$fa0014$ と $fa0015$ の画像をもとにした2つの参照の比較です。

---

## 1. ブランド・キャラクターの特徴

- **$fa0014$**
  - 赤いリボンとシンプルな顔のネコキャラクターを使用。
  - ビジュアルアイデンティティ：クラシック、ノスタルジック、「かわいい」スタイル。
  - メッセージテキスト："Hello TOKIMEKI"（「トキメキ」= ときめく気持ち）。

- **$fa0015$**
  - 長い耳と赤いほっぺの黄色いネズミキャラクターを使用。
  - ビジュアルアイデンティティ：エネルギッシュ、遊び心があり、ゲーム・アニメと強く結びついている。
  - 多様な表情とアクセサリー（帽子、サングラス等）で個性を演出。

**比較：**
$fa0014$ は甘くノスタルジックな女の子らしいかわいさ、$fa0015$ は表情豊かでエネルギッシュなキャラクター主導の楽しさ。

---

## 2. 商品・パッケージ

どちらも同じキャンディブランド（「ピュレ」グミ）で、キャラクターコラボのデザインが異なります。

- **共通点**
  - スタンドアップパウチ。
  - 明るく鮮やかな色使い。
  - キャラクターの顔がパッケージ前面を占める。
  - キャラクター周辺にフルーツやキャンディのイラスト。
  - 限定コラボデザインの可能性が高い。

- **相違点**
  - **$fa0014$**:
    - 全パックで赤が主要カラー。
    - レイアウトが統一感があり、各パックはポーズのみ微妙に異なる。
    - 背景にリンゴ・靴・布などのプロップを配置し、ライフスタイル・ファッション感を演出。
  - **$fa0015$**:
    - パックごとに背景色が異なる（ピンク・青・緑・黄など）。
    - 色と表情でフレーバーや雰囲気をより明確に差別化。
    - 青と水色のツートーン背景にキャンディを散りばめたクリーンでモダンなデザイン。`}</pre>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
