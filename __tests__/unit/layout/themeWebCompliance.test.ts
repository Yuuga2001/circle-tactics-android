/**
 * Web 版 (CircleTactics/src/index.css, Board.module.css, Piece.module.css) を
 * "正" として、Android 版のテーマ定数が完全に一致することを検証する。
 *
 * このテストが FAIL した場合は、Android 版が Web 版の UI 仕様から逸脱している。
 */
import {
  COLORS,
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  PIECE_SIZE_RATIO,
  PIECE_VERTICAL_OFFSET_RATIO,
  PIECE_Z_INDEX,
  BOARD_GAP,
  BOARD_PADDING,
  RADIUS,
} from '../../../src/styles/theme';

// ── Web 版 CSS 変数（index.css :root）────────────────────────────────────────
const WEB = {
  bgColor: '#f3e9d8',
  boardFrameColor: '#8d6e63',
  cellColor: '#bcaaa4',
  cellHoverColor: '#c9b9b3',
  highlightColor: '#ffc107',
  playerRed: '#b74d4d',
  playerRedDark: '#8a2c2c',
  playerBlue: '#5a7d9a',
  playerBlueDark: '#3e5a72',
  playerYellow: '#c7a003',
  playerYellowDark: '#9e7f02',
  playerGreen: '#6a994e',
  playerGreenDark: '#4f7a33',
};

// ── Web 版 Board.module.css ───────────────────────────────────────────────────
const WEB_BOARD = {
  gap: 5,          // gap: 5px
  padding: 8,      // padding: 8px
  borderWidth: 4,  // border: 4px solid
  borderRadius: 10, // border-radius: 10px
};

// ── Web 版 Cell.module.css ────────────────────────────────────────────────────
const WEB_CELL = {
  borderWidth: 2,  // border: 2px solid
  borderRadius: 4, // border-radius: 4px
};

// ── Web 版 Piece.module.css ───────────────────────────────────────────────────
const WEB_PIECE = {
  smallRatio: 0.33,   // width/height: 33%
  mediumRatio: 0.66,  // width/height: 66%
  // LARGE: calc(100% - 4px) ≈ ratio 0.96 for typical cell sizes
  largeApproxRatio: 0.96,
  // z-index
  smallZIndex: 3,
  mediumZIndex: 2,
  largeZIndex: 1,
  // translate Y offset ratios (derived from CSS translate values)
  // SMALL:  translate(-50%, -80%) → center offset = -0.3 * diameter
  // MEDIUM: translate(-50%, -50%) → center offset = 0
  // LARGE:  translate(-50%, -20%) → center offset = +0.3 * diameter
  smallVertRatio: -0.3,
  mediumVertRatio: 0,
  largeVertRatio: 0.3,
};

describe('カラー — Web 版 CSS 変数との一致', () => {
  it('bg = --bg-color (#f3e9d8)', () => expect(COLORS.bg).toBe(WEB.bgColor));
  it('boardFrame = --board-frame-color (#8d6e63)', () => expect(COLORS.boardFrame).toBe(WEB.boardFrameColor));
  it('cell = --cell-color (#bcaaa4)', () => expect(COLORS.cell).toBe(WEB.cellColor));
  it('cellHover = --cell-hover-color (#c9b9b3)', () => expect(COLORS.cellHover).toBe(WEB.cellHoverColor));
  it('highlight = --highlight-color (#ffc107)', () => expect(COLORS.highlight).toBe(WEB.highlightColor));
});

describe('プレイヤーカラー — Web 版 CSS 変数との一致', () => {
  it('RED = --player-red (#b74d4d)', () => expect(PLAYER_COLORS.RED).toBe(WEB.playerRed));
  it('BLUE = --player-blue (#5a7d9a)', () => expect(PLAYER_COLORS.BLUE).toBe(WEB.playerBlue));
  it('YELLOW = --player-yellow (#c7a003)', () => expect(PLAYER_COLORS.YELLOW).toBe(WEB.playerYellow));
  it('GREEN = --player-green (#6a994e)', () => expect(PLAYER_COLORS.GREEN).toBe(WEB.playerGreen));
});

describe('プレイヤーボーダーカラー — Web 版 *-dark 変数との一致', () => {
  it('RED dark = --player-red-dark (#8a2c2c)', () => expect(PLAYER_BORDER_COLORS.RED).toBe(WEB.playerRedDark));
  it('BLUE dark = --player-blue-dark (#3e5a72)', () => expect(PLAYER_BORDER_COLORS.BLUE).toBe(WEB.playerBlueDark));
  it('YELLOW dark = --player-yellow-dark (#9e7f02)', () => expect(PLAYER_BORDER_COLORS.YELLOW).toBe(WEB.playerYellowDark));
  it('GREEN dark = --player-green-dark (#4f7a33)', () => expect(PLAYER_BORDER_COLORS.GREEN).toBe(WEB.playerGreenDark));
});

describe('ボードレイアウト定数 — Board.module.css との一致', () => {
  it('BOARD_GAP = Web gap 5px', () => expect(BOARD_GAP).toBe(WEB_BOARD.gap));
  it('BOARD_PADDING = Web padding 8px', () => expect(BOARD_PADDING).toBe(WEB_BOARD.padding));
  it('RADIUS.board = Web border-radius 10px', () => expect(RADIUS.board).toBe(WEB_BOARD.borderRadius));
});

describe('セルレイアウト定数 — Cell.module.css との一致', () => {
  it('RADIUS.cell = Web cell border-radius 4px', () => expect(RADIUS.cell).toBe(WEB_CELL.borderRadius));
});

describe('ピースサイズ比率 — Piece.module.css との一致', () => {
  it('SMALL ratio = Web 33% (0.33)', () => expect(PIECE_SIZE_RATIO.SMALL).toBe(WEB_PIECE.smallRatio));
  it('MEDIUM ratio = Web 66% (0.66)', () => expect(PIECE_SIZE_RATIO.MEDIUM).toBe(WEB_PIECE.mediumRatio));
  it('LARGE ratio ≈ Web calc(100%-4px)/cell ≈ 0.96', () =>
    expect(PIECE_SIZE_RATIO.LARGE).toBeCloseTo(WEB_PIECE.largeApproxRatio, 2));
});

describe('ピース垂直オフセット比率 — Android モバイル最適化値（全 0）', () => {
  // LARGE は直径 96% でコンテナほぼ満杯のためオフセット不可。全サイズ中央揃え。
  it('SMALL vertical offset ratio = 0 (Android最適化: 同心円スタック)', () =>
    expect(PIECE_VERTICAL_OFFSET_RATIO.SMALL).toBe(0));
  it('MEDIUM vertical offset ratio = 0 (中央揃え)', () =>
    expect(PIECE_VERTICAL_OFFSET_RATIO.MEDIUM).toBe(0));
  it('LARGE vertical offset ratio = 0 (Android最適化: オフセット不可)', () =>
    expect(PIECE_VERTICAL_OFFSET_RATIO.LARGE).toBe(0));
});

describe('ピース z-index — Piece.module.css との一致', () => {
  it('SMALL z-index = 3 (Web: z-index:3)', () => expect(PIECE_Z_INDEX.SMALL).toBe(WEB_PIECE.smallZIndex));
  it('MEDIUM z-index = 2 (Web: z-index:2)', () => expect(PIECE_Z_INDEX.MEDIUM).toBe(WEB_PIECE.mediumZIndex));
  it('LARGE z-index = 1 (Web: z-index:1)', () => expect(PIECE_Z_INDEX.LARGE).toBe(WEB_PIECE.largeZIndex));
});
