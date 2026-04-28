# circle-tactics-android UI/UX 大改修計画

## Context（背景）
Web 版 `/Users/tachikawa/MyApp/CircleTactics`（React + Vite + CSS Modules）の UI/UX を**正**とし、Android 版（Expo + React Native + expo-router）の見た目・操作性をこれに**ゼロから**揃える。ロジック層（`src/logic/`, `src/online/`, `src/i18n/`, `src/audio/`, `src/types/`）は再利用し、UI 層（`src/components/`, `app/`, `src/styles/theme.ts`）を全面刷新する。

## 主要ギャップ（Web 正 → Android 現状）

| 項目 | Web版 (正) | Android現状 | 対応 |
|---|---|---|---|
| テーマ | ライト・木目調ベージュ `#f3e9d8` | ダーク・ネイビー `#1a1a2e` | 全面置換 |
| フォント | M PLUS Rounded 1c | システム | `expo-font` でロード |
| プレイヤー色 | ミュート系 (#b74d4d, #5a7d9a, #c7a003, #6a994e) | ビビッド系 | ミュート系へ |
| 背景 | 木目テクスチャ + 勝利時グラデ | 単色 | テクスチャ画像追加 |
| TitleScreen | メニュー/ローカル設定 2モード + DemoBoard | 1画面のみ | 2モード+デモ追加 |
| ボード/セル | 角丸+二重影、勝利グロウ、valid-pulse | 簡素 | 装飾フル再現 |
| Piece | S(33%,上寄せ) M(66%,中央) L(100%,下寄せ) | 0.3/0.55/0.8 同心 | サイズ比率＋オフセット見直し |
| PlayerHand | ピル状、ゴールドハイライト、ドラッグ | 簡素 | 装飾再現 |
| ロビー画面群 | 統一ピル型ボタン、ゴーストボタン、QR枠 | バラバラ | 共通ボタンで統一 |
| Toast/Dialog | アニメ付き（pop/fade） | 静的/未実装 | reanimated で再現 |
| LanguageSelector | 左上固定 15言語ドロップ | 既存だが見た目違 | 統一 |
| MenuButton | 右上 FAB+パネル | 既存だが見た目違 | 統一 |
| アニメ | confetti, placePiece, valid/win-pulse, panel-pop | ほぼ無し | reanimated で実装 |

## 保持するもの（UI 改修の対象外）
- `src/logic/` 全て（gameReducer, ai, winConditions, seating）
- `src/online/` 全て（api, types, clientId, activeGame, usePolling, useHeartbeat）
- `src/i18n/index.tsx`（文言は Web の翻訳と差分があれば後段で同期）
- `src/audio/audioManager.ts` および音声ファイル
- `src/types/index.ts`
- `src/hooks/useAppInit.ts`, `useGameSounds.ts`, `useAudioSettings.ts`
- `app/` のルーティング構造（ファイル配置はそのまま、中身のレイアウトのみ更新）

## 改修フェーズ（優先順）

### Phase 1: 基盤（デザインシステム整備）
- [ ] **1-1** `src/styles/theme.ts` を Web 版 `index.css` の CSS 変数に揃えて全面書き換え
  - `COLORS`: bg=#f3e9d8, boardFrame=#8d6e63, cell=#bcaaa4, cellHover=#c9b9b3, highlight=#ffc107, players (mute), playersDark
  - `FONTS`: family='MPLUSRounded1c', sizes (clamp 相当を windowDimensions で動的計算)
  - `RADIUS`: pill=999, card=14, section=10, cell=4
  - `SHADOWS`: subtle/standard/elevated/board (RN 用 elevation+shadow*)
  - `SPACING` 据え置き
  - `PIECE_SIZE_RATIO`: SMALL=0.33, MEDIUM=0.66, LARGE=0.96
  - `PIECE_VERTICAL_OFFSET`: SMALL=-30%, MEDIUM=0, LARGE=+30% (Cell内での y シフト)
- [ ] **1-2** フォント導入: `expo-font` 追加し `MPLUSRounded1c-Regular/Bold.ttf` を `assets/fonts/` 配置、`app/_layout.tsx` でロード
- [ ] **1-3** 木目テクスチャを assets 化: `assets/textures/wood-pattern.png` を Web 由来 URL からダウンロード（または Skia パターン代替）→ 200×200 リピート背景
- [ ] **1-4** 共通コンポーネント新設 `src/components/ui/`:
  - `Button.tsx` (variants: primary/secondary/ghost/toggle、props: title, color?, disabled, onPress, fullWidth)
  - `Card.tsx` (white 0.85 alpha bg, radius 14, padding)
  - `ScreenContainer.tsx` (SafeArea + 木目背景 + 共通余白)
  - `Tag.tsx` (AI/You/Host バッジ)

### Phase 2: タイトル画面とデモ
- [ ] **2-1** `TitleScreen.tsx` を 2モード（menu / local）構造に再実装
  - menu: 大タイトル「CircleTactics」+ 副題 + ルール 2 段落 + Play Local(赤) + Play Online(青) + DemoBoard
  - local: 2x2 シートグリッド（HUMAN/AI トグル）+ サマリ + Start + 戻る
- [ ] **2-2** `components/DemoBoard.tsx` 新規作成（4x4、AI 自動対戦、Web 同等のループ）
- [ ] **2-3** `app/index.tsx` を新 TitleScreen 連携に更新

### Phase 3: ゲーム画面（ローカル）
- [ ] **3-1** `Board.tsx`: 4x4 grid、5px gap、12px radius、boardFrame bg、二重 shadow、木目フレーム
- [ ] **3-2** `Cell.tsx`: cellColor bg、4px radius、有効時 valid-pulse（reanimated infinite）、勝利時 win-pulse + ゴールドグロー
- [ ] **3-3** `Piece.tsx`: 円形、サイズ別 z-index (S=3,M=2,L=1)、border=playerDark、配置時 placePiece scale animation
- [ ] **3-4** `Game.tsx` レイアウト刷新: Header(タイトル) → HandsSummary → Board(オーバーレイ含む) → StatusBar → PlayerHand → 勝利時アクション
- [ ] **3-5** ルーレット演出: 70 + pow(t,1.8)*360 のステップ遅延で 3 周 + ストップを reanimated/timer で再現
- [ ] **3-6** Confetti: 勝利時に 50 個生成、translateY+rotate、勝者色背景フェード

### Phase 4: 手札・サマリ
- [ ] **4-1** `PlayerHand.tsx`: 横並び 3 ボタン（S/M/L）、選択時ゴールド枠+上方向トランスフォーム、disabled で grayscale 風減色、`x N` カウント
- [ ] **4-2** `HandsSummary.tsx`: 1.4fr|1fr|1fr|1fr グリッド、ヘッダ + 4 行、現プレイヤー行ゴールドハイライト、AI/You タグ
- [ ] **4-3** `useBoardDrag` を新 Cell/PlayerHand に対応（既存ロジック流用、視覚 FB のみ調整）

### Phase 5: オンライン画面群
- [ ] **5-1** `LobbyScreen.tsx`: 共通レイアウト適用（タイトル+説明+Create(赤)+Join(白)+Back(ゴースト)）
- [ ] **5-2** `HostScreen.tsx`: ルームコード等幅大表示+Copy トグル、QR (220px、margin 1)、Players リスト（color dot + name + Host/AI）、Start 主ボタン
- [ ] **5-3** `JoinScreen.tsx`: 6 桁数値入力、エラー表示、Join 主ボタン
- [ ] **5-4** `WaitingRoom.tsx`: ルームコード + Players + 「You are {COLOR}」表示 + Leave
- [ ] **5-5** `OnlineGame.tsx`: 新 Game.tsx の構造を継承、ポーリング/heartbeat/降格は維持
- [ ] **5-6** `SpectatorView.tsx`: ⏳ キューバナー + 位置 + Read-only Board/Summary + Leave

### Phase 6: 共通 UI 部品
- [ ] **6-1** `LanguageSelector.tsx`: 左上固定、🌐+chevron、ドロップダウン（max-height 65vh、選択ゴールド）、dropdown-pop アニメ
- [ ] **6-2** `MenuButton.tsx`: 右上 FAB、パネルモード（title/local/online/other）、BGM/SE トグル、確認ダイアログ
- [ ] **6-3** `Toast.tsx`: bottom-center、pop+fade、auto-dismiss 2s、safe-area 考慮
- [ ] **6-4** `ResumeDialog.tsx` / `ConfirmDialog.tsx`: オーバーレイ rgba(40,25,20,.55) + カード（白 3px border, radius 14） + 2 ボタン

### Phase 7: アニメーション最終調整
- [ ] **7-1** `panel-pop`/`dropdown-pop`: cubic-bezier(0.18, 0.89, 0.32, 1.28) 相当を reanimated easing で再現
- [ ] **7-2** `valid-pulse` 1.4s infinite, `win-pulse` 1.1s infinite を reanimated `withRepeat`
- [ ] **7-3** Cell active state: scale(0.94) + inset highlight（タップフィードバック）
- [ ] **7-4** Drag-over: scale(0.97) + 強調ハイライト

### Phase 8: 文言・i18n 同期
- [ ] **8-1** `src/i18n/index.tsx` のキーを Web 版 `src/i18n/index.tsx` と diff し、不足キーを追加・既存翻訳を上書き

### Phase 9: 検証・テスト
- [ ] **9-1** 既存 `__tests__/` を新コンポーネント API に追従させて修正（テストID/aria→testID 等）
- [ ] **9-2** `npm test` パス確認（カバレッジ閾値 80% 維持）
- [ ] **9-3** Android エミュレータ実機起動（`npm run android`）して TitleScreen→Local→勝利、Lobby→Host→Join 一連を手動確認
- [ ] **9-4** スクリーンショットを取得し Web 版 UI と並べて差分確認

## 想定する変更ファイル

### 新規
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/ScreenContainer.tsx`
- `src/components/ui/Tag.tsx`
- `src/components/DemoBoard.tsx`
- `src/components/ResumeDialog.tsx`
- `src/components/ConfirmDialog.tsx`
- `assets/fonts/MPLUSRounded1c-Regular.ttf`, `MPLUSRounded1c-Bold.ttf`
- `assets/textures/wood-pattern.png`

### 全面書き換え
- `src/styles/theme.ts`
- `src/components/TitleScreen.tsx`
- `src/components/Game.tsx`
- `src/components/OnlineGame.tsx`
- `src/components/Board.tsx`
- `src/components/Cell.tsx`
- `src/components/Piece.tsx`
- `src/components/PlayerHand.tsx`
- `src/components/HandsSummary.tsx`
- `src/components/LobbyScreen.tsx`
- `src/components/HostScreen.tsx`
- `src/components/JoinScreen.tsx`
- `src/components/WaitingRoom.tsx`
- `src/components/SpectatorView.tsx`
- `src/components/Toast.tsx`
- `src/components/MenuButton.tsx`
- `src/components/LanguageSelector.tsx`
- `src/components/useBoardDrag.tsx`

### 微修正
- `app/_layout.tsx` (フォントロード追加)
- `app.json` (splash背景を #f3e9d8 へ、userInterfaceStyle を 'light' へ)
- `package.json` (`expo-font` 追加)
- `src/i18n/index.tsx` (文言同期のみ)
- `__tests__/integration/components/*.test.tsx` (UI 構造変更に追従)

## 検証方法（受け入れ基準）

1. `npm test -- --coverage` がカバレッジ閾値を満たしつつ全 PASS
2. `npm run android` で Pixel エミュ起動 → 以下の動線が破綻なく動く:
   - タイトル → ローカル設定 → ローカル対戦 → 勝利 → タイトル
   - タイトル → オンライン → ホスト作成 → コード/QR 表示 → Start
   - タイトル → オンライン → 参加 → 待機 → ゲーム
3. 主要画面のスクリーンショットを取り、Web 版と並べたとき配色・字面・部品配置がほぼ一致
4. アニメーション（ルーレット、配置、勝利グロー、Toast pop）が滑らかに再生

## ロールバック
git の現状 commit を控えておき、問題発生時は branch を捨てる方針で進める（必要なら作業前に `git stash` または `git checkout -b ui-overhaul`）。

## 進め方の提案

ボリュームが大きいので、**Phase 1 → 2 → 3** の順で着手し、Phase 1 完了時点で一度動作確認・フィードバックをもらう運用を提案。Phase 1 だけでも見た目が大きく変わるため、方向性のすり合わせがしやすい。

---

## レビュー欄
（実装後に随時記入）

