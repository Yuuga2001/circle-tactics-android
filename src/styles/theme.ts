import { Platform } from 'react-native';

// ── Web版 (CircleTactics/src/index.css) のCSS変数に完全準拠 ──────────────
export const COLORS = {
  bg: '#f3e9d8',
  boardFrame: '#8d6e63',
  cell: '#bcaaa4',
  cellHover: '#c9b9b3',
  highlight: '#ffc107',
  text: '#333333',
  textMuted: '#5a4a40',
  textHint: '#7a6a60',
  white: '#ffffff',
  // 後方互換用エイリアス（既存の COLORS.background などを参照しているコード向け）
  background: '#f3e9d8',
  surface: 'rgba(255,255,255,0.85)',
  surfaceAlt: 'rgba(255,255,255,0.7)',
  border: '#8d6e63',
  textOnDark: '#ffffff',
  accent: '#b74d4d',
} as const;

export const PLAYER_COLORS = {
  RED: '#b74d4d',
  BLUE: '#5a7d9a',
  YELLOW: '#c7a003',
  GREEN: '#6a994e',
} as const;

export const PLAYER_BORDER_COLORS = {
  RED: '#8a2c2c',
  BLUE: '#3e5a72',
  YELLOW: '#9e7f02',
  GREEN: '#4f7a33',
} as const;

// 勝利時の背景にかぶせる半透明レイヤ用
export const PLAYER_VICTORY_OVERLAY = {
  RED: 'rgba(183, 77, 77, 0.7)',
  BLUE: 'rgba(90, 125, 154, 0.7)',
  YELLOW: 'rgba(199, 160, 3, 0.7)',
  GREEN: 'rgba(106, 153, 78, 0.7)',
} as const;

// シート選択画面で使う薄塗り
export const PLAYER_SEAT_TINT = {
  RED: 'rgba(220, 75, 75, 0.10)',
  BLUE: 'rgba(80, 130, 200, 0.10)',
  YELLOW: 'rgba(220, 180, 60, 0.12)',
  GREEN: 'rgba(110, 170, 90, 0.12)',
} as const;

export const PIECE_SIZE_RATIO = {
  SMALL: 0.33,
  MEDIUM: 0.66,
  LARGE: 0.96, // Web は calc(100% - 4px) ≈ 96% (cell 約60px時)
} as const;

// LARGE は直径 96% でコンテナをほぼ埋めるため垂直オフセット不可。
// 全サイズをセル中央揃えにすると SMALL/MEDIUM/LARGE が同心円状に重なり
// z-index (SMALL=3 > MEDIUM=2 > LARGE=1) でスタックが自然に見える。
export const PIECE_VERTICAL_OFFSET_RATIO = {
  SMALL: 0,
  MEDIUM: 0,
  LARGE: 0,
} as const;

export const PIECE_Z_INDEX = {
  SMALL: 3,
  MEDIUM: 2,
  LARGE: 1,
} as const;

export const FONT_FAMILY = {
  regular: 'MPLUSRounded1c-Regular',
  bold: 'MPLUSRounded1c-Bold',
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  // セマンティック
  body: 14,
  rule: 14,
  buttonSm: 13,
  button: 17,
  buttonLg: 22,
  title: 40,
  titleSm: 24,
  subtitle: 14,
  hint: 13,
  status: 18,
  victory: 30,
  victoryReason: 16,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  pill: 999,
  card: 14,
  section: 12,
  button: 16,
  cell: 4,
  board: 10,
  small: 8,
} as const;

export const SHADOWS = {
  subtle: {} as any,
  standard: {} as any,
  elevated: {} as any,
  board: {} as any,
  announce: {} as any,
} as const;

export const CELL_SIZE = 72;
export const BOARD_PADDING = 8;
export const BOARD_GAP = 5;

export type PlayerKey = keyof typeof PLAYER_COLORS;
