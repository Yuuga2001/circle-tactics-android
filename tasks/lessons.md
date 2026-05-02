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
