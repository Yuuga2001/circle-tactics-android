# CircleTactics Android

React Native + Expo で構築した **CircleTactics** のモバイルアプリ（Android / iOS 対応）。  
Web 版（[circle-tactics.riverapp.jp](https://circle-tactics.riverapp.jp)）とオンライン対戦が可能。

---

## ゲーム概要

4×4 のボードにサイズの異なるコマ（S / M / L）を置いていく 2〜4 人対戦ゲーム。

- 相手のコマに **大きいサイズのコマを重ねて**奪える
- 自分の色で 1 列・1 行・1 斜め・または 1 マス 3 段すべてを制圧すると勝利
- 各プレイヤーの持ちコマは S / M / L 各 **4 枚**

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| フレームワーク | React Native 0.81 + Expo SDK 54 |
| 言語 | TypeScript 5.9 |
| ルーティング | expo-router v6 |
| オーディオ | expo-audio（BGM / SE・無音 keepalive で音割れ防止） |
| ストレージ | @react-native-async-storage/async-storage |
| テスト | Jest + @testing-library/react-native |
| CI 対象 | Android（EAS Build）|

---

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（Android エミュレータ or 実機）
npx expo start --android
```

> **前提:** Node.js 20+、Android Studio（エミュレータ）または実機が必要。

---

## プロジェクト構成

```
app/                   expo-router のルート定義
  index.tsx            タイトル画面
  local.tsx            ローカル対戦
  online/
    lobby.tsx          オンラインロビー
    host.tsx           ルーム作成
    join.tsx           ルーム参加
    waiting.tsx        待合室
    playing.tsx        オンライン対戦
    spectating.tsx     観戦 / 参加待ち

src/
  components/          UI コンポーネント
    Game.tsx           ローカル対戦コア
    OnlineGame.tsx     オンライン対戦コア
    AppChrome.tsx      全画面共通ヘッダーオーバーレイ
    Board.tsx          ゲームボード
    PlayerHand.tsx     手持ちコマ表示
    SpectatorView.tsx  観戦 / 参加待ち画面
  logic/
    gameReducer.ts     ゲーム状態管理（純粋関数）
    winConditions.ts   勝利判定
    ai.ts              AI（最善手探索）
  online/
    api.ts             サーバー API クライアント
    usePolling.ts      セッション定期取得
    activeGame.ts      アクティブゲーム永続化 + AppChrome pub/sub
  audio/
    audioManager.ts    BGM / SE 管理（設定を AsyncStorage に永続化）
  i18n/
    index.tsx          多言語対応（日本語 / 英語 / 中国語繁体 / 簡体）

assets/
  sounds/              BGM・SE・無音 WAV ファイル
  fonts/               M PLUS Rounded 1c
```

---

## オンライン対戦

バックエンドは **Web 版リポジトリ**（`CircleTactics/infra`）の AWS Lambda + API Gateway で提供。  
Android アプリは HTTP ポーリングでセッション状態を同期する。

- ターン制限時間: **30 秒**（超過時は AI が代行）
- 最大 4 人（人間 + AI 混在可）
- 待機キュー対応（定員 4 人満席時は観戦しながら自動参加）

---

## テスト

```bash
# 全テスト実行
npm test

# カバレッジ付き
npm test -- --coverage
```

カバレッジ閾値（CI 基準）:

| 指標 | 閾値 |
|---|---|
| Statements | 80% |
| Functions | 80% |
| Branches | 75% |
| Lines | 80% |

---

## ビルド（EAS Build）

```bash
# Android APK / AAB のビルド
npx eas build --platform android
```

---

## ライセンス

Private
