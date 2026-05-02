# 教訓

## useEffect と useRef のスナップショット — stale ref に注意 (2026-05-02)

**事象**: ルーレットアニメーションの最終ハイライトが、`turnOrder[0]`（実際の先攻プレイヤー）と一致しない場合があった。announce 表示は YELLOW なのに、テーブルでは RED の行がハイライトされる、など。

**原因**: アニメーションを駆動する useEffect が `turnOrderRef.current` を読んでいたが、依存配列が `[phase]` のみだったため、RESTART_GAME 時に以下の順序で実行され stale ref を捕捉していた：
1. dispatch + `setPhase('rouletting')` で再レンダー（state.turnOrder は新しい順序に更新済み）
2. 宣言順に走る useEffect のうち、ルーレット useEffect が**先に**走り、`turnOrderRef.current`（=前ゲームの古い順序）を `order` に捕捉して setTimeout 群をスケジュール
3. その後「Re-arm」useEffect が走って ref を更新するが、すでに設定された timeout は古い `order` を使うため、最終ハイライトが古い `order[0]` になる

**ルール**:
- **複数 useEffect 間で `useRef.current` をデータの受け渡しに使うのは避ける。** 同一レンダーで両方が走る場合、宣言順に依存して脆いコードになる。
- 派生した値が必要なら、**props/state を直接 useEffect 内で読み、依存配列に含める**。
- 非同期コールバック（setTimeout/Promise）に渡す値は、可能な限り**スコープ内ローカル変数として捕捉**する（ref ではなく）。
- 「最終状態が特定の値になるべき」アニメーションでは、ループの算術に依存せず、**最後に明示的にその値をセットするガード**を入れる（保険）。

**適用範囲**: アニメーション、デバウンス、外部 API 呼び出しなど、setTimeout/setInterval 経由で値を扱うすべての useEffect。

## ポーリング更新される state を useEffect 依存配列に入れない (2026-05-02)

**事象**: 上記の修正をオンライン対戦版（OnlineGame.tsx）にも横展開したところ、ルーレットアニメーションが永遠に終わらないデグレが発生。

**原因**: OnlineGame の `current` はサーバーポーリングで毎回新しいオブジェクト参照になる。`current.turnOrder` を依存配列に含めると、ポーリングのたびに useEffect が再実行され、setTimeout 群が cleanup → 再スケジュールを無限ループ。

**ローカル版（Game.tsx）との違い**: Game.tsx には「ルーレット useEffect」と「Re-arm useEffect」が分かれており宣言順による stale ref 問題があったが、OnlineGame.tsx は元々ルーレット useEffect 内で `turnOrderRef.current = current.turnOrder` してから読む構造で、stale ref 問題は存在しなかった。**同じパターンに見えても構造が違えば bug の有無も違う。**

**ルール**:
- **横展開する前に、対象ファイル個別に同じ bug が再現するか確認する。** 「同じパターンだから同じ修正」と機械的に適用しない。
- **ポーリング/サブスクリプション由来の参照は依存配列に入れない。** 入れる必要があるなら `JSON.stringify` や `.join(',')` などで内容ベースの安定キーに変換するか、ref パターンを使う。
- 修正をデグレなしで導入するため、横展開時も**それぞれ実機で動作確認する**。
