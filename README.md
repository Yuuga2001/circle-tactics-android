# circle-tactics-android

<p align="center">
  <strong>○×ゲームを進化させた、戦略ボードゲーム</strong><br>
  <em>A strategic board game evolved from Tic-Tac-Toe</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-blue?logo=react" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-black?logo=expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Version-1.1.0_(4)-green" />
  <img src="https://img.shields.io/badge/Tests-639-brightgreen" />
</p>

React Native + Expo で構築した **CircleTactics** のモバイルアプリ（Android / iOS 対応）。  
Web 版（[circle-tactics.riverapp.jp](https://circle-tactics.riverapp.jp)）とオンライン対戦が可能。

---

## 関連プロジェクト

| プラットフォーム | リポジトリ | 技術スタック |
|---|---|---|
| **Web 版** | `CircleTactics` | React 18 + Vite、AWS Amplify + Lambda + DynamoDB |
| **Android 版（本リポジトリ）** | `circle-tactics-android` | React Native 0.81 + Expo SDK 54 |
| **iOS 版** | `circle-tactics-ios` | SwiftUI ネイティブ |

オンライン対戦バックエンド（AWS Lambda + DynamoDB）は Web 版リポジトリが管理し、3 プラットフォームで共有。

---

## ゲームルール

### プレイヤーとコマ

各プレイヤーは固定の色（RED / BLUE / YELLOW / GREEN）を持ち、S / M / L の 3 サイズの駒をそれぞれ **4 個ずつ（計 12 個）** 所持。

### コマの重ね置き

自分より **小さいサイズのコマが置かれているマス** には、大きいコマを重ねて置ける（所有権を奪える）。

### 勝利条件

| 条件 | 内容 |
|---|---|
| **Cell Win** | 1 マス内に同じプレイヤーの S・M・L すべてを揃える |
| **Board Win** | 盤面全体で縦・横・斜めのいずれかに 4 マス連続を支配する |

全 48 スロット（16 マス × 3 段）が埋まった場合は**引き分け**。

---

## 機能一覧

### ローカル対戦
- 🎮 **1〜4 人混合対戦** — 人間プレイヤーと AI を自由に組み合わせ
- 🎲 **先攻決定ルーレット** — ゲーム開始・New Game のたびにランダムで先攻を決定
- 🧠 **戦略的 AI** — 「勝てる手 → ブロック → 有効手」の優先度で思考
- 💡 **有効マスハイライト** — 現ターンで置けるマスのみパルスで光る
- ⏭ **自動スキップ** — 手札不足・置き場所なしのとき自動パス
- 🏆 **勝利演出** — 決め手セルのハイライト + 紙吹雪アニメーション
- 📋 **手札サマリ** — 全プレイヤーの残り駒数を常時表示
- 🎬 **タイトルデモ盤面** — AI 同士が自動対戦するデモを表示

### オンライン対戦
- 🌐 **ルーム作成** — 6 桁コード + QR コードを発行して参加者を招待
- 🔗 **URL 自動入力** — `?room=XXXXXX` の URL で参加画面を自動入力
- ⏱ **30 秒ターン制限** — 残り秒数表示、超過は AI が代行
- 💓 **ハートビート** — 10 秒ごとに接続を通知、切断は 30 秒後に AI 交代
- 🔄 **ポーリング** — 1.5 s / 2 s / 3 s / 5 s の状況別間隔で状態同期
- 👥 **観戦キュー** — 5 人目以降は観戦キューに並び、空席で自動昇格
- 📡 **切断オーバーレイ** — 通信エラー時に再試行 UI を表示
- 🔁 **セッション復帰** — 6 時間以内の未終了ルームに自動復帰
- ▶️ **誰でもスタート可能** — ルームに参加したプレイヤーであれば誰でもゲームを開始できる

### サウンド・設定
- 🎵 **BGM + 効果音（SE）** — コマ置き・先攻発表・ルーレット・勝利など複数種類
- 🌐 **16 言語対応** — 日本語 / 英語 / 中国語（簡体・繁体）/ 韓国語 / スペイン語 / フランス語 / ドイツ語 / イタリア語 / ポルトガル語 / ロシア語 / アラビア語 / ヒンディー語 / トルコ語 / インドネシア語
- ⚙️ **永続化設定** — BGM / SE / 言語を AsyncStorage に保存
- 🗑 **ローカルデータ完全削除** — clientId・音声設定・言語設定・ソロプレイ記録をすべて消去

### ソロプレイ記録
- 📊 **戦績記録** — 1 人（対 AI 3 体）のソロプレイ時に勝敗を自動記録
- 🏅 **勝率表示** — 通算勝率をリスト先頭に表示
- 📅 **履歴一覧** — 日時・勝敗を一覧表示（SoloRecordList コンポーネント）

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | React Native 0.81 + Expo SDK 54 |
| 言語 | TypeScript 5.9 |
| ルーティング | expo-router 6 |
| オーディオ | expo-audio（BGM / SE） |
| ストレージ | @react-native-async-storage/async-storage |
| クリップボード | expo-clipboard |
| QR コード | react-native-qrcode-svg |
| テスト | Jest + @testing-library/react-native |
| アーキテクチャ | New Architecture（newArchEnabled: true） |

---

## 必要環境

| ツール | 備考 |
|---|---|
| Node.js 20+ | |
| Android Studio | エミュレータ用（または実機） |
| Java 17 | リリースビルド用（`brew install openjdk@17`） |
| Android SDK | `~/Library/Android/sdk` |

---

## セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/Yuuga2001/circle-tactics-android.git
cd circle-tactics-android

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定（オンライン対戦を使う場合）
cp .env.example .env
# EXPO_PUBLIC_API_BASE_URL を設定

# 4. 開発サーバー起動
npx expo start --android
```

---

## プロジェクト構成

```
app/                           # expo-router ルート定義
├── _layout.tsx                # ルートレイアウト（フォント読み込み・音声初期化）
├── index.tsx                  # タイトル画面
├── local.tsx                  # ローカル対戦
└── online/
    ├── lobby.tsx              # オンラインロビー
    ├── host.tsx               # ルーム作成
    ├── join.tsx               # ルーム参加
    ├── waiting.tsx            # 参加者待機室
    ├── playing.tsx            # オンライン対戦
    └── spectating.tsx         # 観戦 / 参加待ち

src/
├── components/                # UI コンポーネント
│   ├── TitleScreen.tsx        # タイトル（デモ盤面含む）
│   ├── Game.tsx               # ローカル対戦コア
│   ├── OnlineGame.tsx         # オンライン対戦コア
│   ├── AppChrome.tsx          # 全画面共通ヘッダー
│   ├── MenuButton.tsx         # メニューパネル（設定・データ削除）
│   ├── Board.tsx              # 4×4 ゲームボード
│   ├── Cell.tsx               # セル
│   ├── Piece.tsx              # 駒（S / M / L）
│   ├── PlayerHand.tsx         # 手持ちコマ選択
│   ├── HandsSummary.tsx       # 全員の残り駒数表示
│   ├── DemoBoard.tsx          # タイトルデモ盤面
│   ├── HostScreen.tsx         # ルーム作成画面（コード・QR・参加者リスト）
│   ├── JoinScreen.tsx         # コード入力画面
│   ├── LobbyScreen.tsx        # Create / Join 分岐
│   ├── WaitingRoom.tsx        # ゲスト待機画面（誰でもスタート可能）
│   ├── SpectatorView.tsx      # 観戦・参加待ち画面
│   ├── SoloRecordList.tsx     # ソロプレイ戦績一覧
│   ├── NetworkErrorView.tsx   # 通信エラー表示
│   ├── AnnounceOverlay.tsx    # 先攻発表・スキップアニメーション
│   ├── Confetti.tsx           # 勝利紙吹雪
│   ├── Toast.tsx              # トースト通知
│   ├── LanguageSelector.tsx   # 言語選択
│   ├── LobbyShared.tsx        # ロビー共有コンポーネント
│   └── ui/                    # 汎用 UI パーツ（Button / Card / ScreenContainer 等）
├── logic/                     # ゲームロジック（純粋関数・Web 版と共通設計）
│   ├── gameReducer.ts         # ゲーム状態遷移
│   ├── winConditions.ts       # 勝利判定（Cell Win / Board Win）
│   ├── ai.ts                  # AI 思考エンジン
│   └── seating.ts             # 人数→プレイヤー割当・ターン順シャッフル
├── online/                    # オンライン対戦
│   ├── api.ts                 # HTTP クライアント + エラー翻訳
│   ├── types.ts               # GameSession 型定義
│   ├── clientId.ts            # AsyncStorage UUID 管理
│   ├── activeGame.ts          # 進行中ゲームの永続化・復帰
│   ├── usePolling.ts          # 状況別間隔ポーリング
│   └── useHeartbeat.ts        # 10 秒ハートビート
├── hooks/                     # カスタムフック
│   ├── useAppInit.ts          # アプリ初期化（フォント・音声）
│   ├── useAudioSettings.ts    # BGM / SE 設定管理
│   ├── useGameSounds.ts       # ゲーム内効果音
│   ├── useNewGame.ts          # 新ゲーム開始処理
│   └── useSoloRecords.ts      # ソロプレイ記録（AsyncStorage）
├── i18n/                      # 多言語対応（16 言語）
└── styles/
    └── theme.ts               # 色 / フォント / spacing（iOS・Web と 1:1 対応）

__tests__/
├── unit/                      # 純粋関数・フック単体テスト
│   ├── audio/
│   ├── components/
│   ├── hooks/
│   ├── layout/
│   ├── logic/
│   └── online/
└── integration/               # コンポーネント・シナリオテスト
    ├── components/
    ├── hooks/
    ├── layout/
    └── scenarios/
```

---

## テスト

```bash
# 全テスト実行（639 件）
npm test

# カバレッジ付き
npm test -- --coverage

# 特定ファイルのみ
npm test WaitingRoom.test
```

### カバレッジ閾値

| 指標 | 閾値 |
|---|---|
| Statements | 80% |
| Functions | 80% |
| Branches | 75% |
| Lines | 80% |

---

## リリースビルド（Android AAB）

### 事前準備

```bash
# Java 17 のインストール（未インストールの場合）
brew install openjdk@17

# Android SDK の確認
ls ~/Library/Android/sdk
```

### ビルド手順

```bash
# 1. ネイティブコードの生成
npx expo prebuild --clean --platform android

# 2. local.properties を作成（Android SDK パスを指定）
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 3. 署名付き AAB ビルド
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
cd android && ./gradlew bundleRelease
```

生成された AAB:
```
android/app/build/outputs/bundle/release/app-release.aab
```

> **署名設定**: `android/app/build.gradle` の `signingConfigs.release` にキーストアのパスを設定。

---

## バージョン管理

`app.json` の 2 項目を更新してリリース。

| 項目 | 説明 | 現在値 |
|---|---|---|
| `version` | 表示バージョン名 | `1.1.0` |
| `android.versionCode` | Google Play 内部バージョン番号（毎リリース +1） | `4` |

---

## ライセンス

Private
