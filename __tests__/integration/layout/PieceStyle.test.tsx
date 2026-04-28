import React from 'react';
import { render } from '@testing-library/react-native';
import Piece from '../../../src/components/Piece';
import {
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  PIECE_SIZE_RATIO,
  PIECE_VERTICAL_OFFSET_RATIO,
} from '../../../src/styles/theme';

// Cell.tsx が Piece に渡す実効セルサイズ（cellBase borderWidth 2px × 2 を除く）
const EFFECTIVE = 68; // cellSize(72) - 4

function flatStyle(element: ReturnType<typeof render>['getByTestId'] extends (id: string) => infer E ? E : never): Record<string, any> {
  const style = (element as any).props.style;
  if (!style) return {};
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.map((s: any) => (s && typeof s === 'object' && !Array.isArray(s) ? s : {})));
}

describe('Piece スタイル — サイズ', () => {
  (['SMALL', 'MEDIUM', 'LARGE'] as const).forEach((size) => {
    it(`${size}: width/height が (effectiveCellSize × ratio) と一致する`, () => {
      const { getByTestId } = render(
        <Piece player="RED" size={size} cellSize={EFFECTIVE} testID="p" static />,
      );
      const expected = EFFECTIVE * PIECE_SIZE_RATIO[size];
      const s = flatStyle(getByTestId('p'));
      expect(s.width).toBeCloseTo(expected, 5);
      expect(s.height).toBeCloseTo(expected, 5);
    });
  });
});

describe('Piece スタイル — 真円', () => {
  (['SMALL', 'MEDIUM', 'LARGE'] as const).forEach((size) => {
    it(`${size}: borderRadius が diameter/2（真円）`, () => {
      const { getByTestId } = render(
        <Piece player="RED" size={size} cellSize={EFFECTIVE} testID="p" static />,
      );
      const diameter = EFFECTIVE * PIECE_SIZE_RATIO[size];
      const s = flatStyle(getByTestId('p'));
      expect(s.borderRadius).toBeCloseTo(diameter / 2, 5);
    });
  });
});

describe('Piece スタイル — 水平センタリング', () => {
  (['SMALL', 'MEDIUM', 'LARGE'] as const).forEach((size) => {
    it(`${size}: left が (effectiveCellSize - diameter) / 2`, () => {
      const { getByTestId } = render(
        <Piece player="RED" size={size} cellSize={EFFECTIVE} testID="p" static />,
      );
      const diameter = EFFECTIVE * PIECE_SIZE_RATIO[size];
      const expectedLeft = (EFFECTIVE - diameter) / 2;
      const s = flatStyle(getByTestId('p'));
      expect(s.left).toBeCloseTo(expectedLeft, 5);
    });
  });
});

describe('Piece スタイル — 垂直配置', () => {
  it('SMALL: top がセル中央（ピース中心 ≈ セル中心、オフセット 0）', () => {
    const { getByTestId } = render(
      <Piece player="RED" size="SMALL" cellSize={EFFECTIVE} testID="p" static />,
    );
    const diameter = EFFECTIVE * PIECE_SIZE_RATIO.SMALL;
    const s = flatStyle(getByTestId('p'));
    const pieceCenter = s.top + diameter / 2;
    expect(pieceCenter).toBeCloseTo(EFFECTIVE / 2, 5);
  });

  it('MEDIUM: top がセル中央（ピース中心 ≈ セル中心）', () => {
    const { getByTestId } = render(
      <Piece player="RED" size="MEDIUM" cellSize={EFFECTIVE} testID="p" static />,
    );
    const diameter = EFFECTIVE * PIECE_SIZE_RATIO.MEDIUM;
    const s = flatStyle(getByTestId('p'));
    const pieceCenter = s.top + diameter / 2;
    expect(pieceCenter).toBeCloseTo(EFFECTIVE / 2, 5);
  });

  it('LARGE: top がセル中央（ピース中心 ≈ セル中心、オフセット 0）', () => {
    const { getByTestId } = render(
      <Piece player="RED" size="LARGE" cellSize={EFFECTIVE} testID="p" static />,
    );
    const diameter = EFFECTIVE * PIECE_SIZE_RATIO.LARGE;
    const s = flatStyle(getByTestId('p'));
    const pieceCenter = s.top + diameter / 2;
    expect(pieceCenter).toBeCloseTo(EFFECTIVE / 2, 5);
  });

  it('SMALL の top が (EFFECTIVE - dia) / 2 （中央揃え）', () => {
    const { getByTestId } = render(
      <Piece player="RED" size="SMALL" cellSize={EFFECTIVE} testID="p" static />,
    );
    const diameter = EFFECTIVE * PIECE_SIZE_RATIO.SMALL;
    const s = flatStyle(getByTestId('p'));
    expect(s.top).toBeCloseTo((EFFECTIVE - diameter) / 2, 5);
  });

  it('LARGE の top が (EFFECTIVE - dia) / 2 （中央揃え）', () => {
    const { getByTestId } = render(
      <Piece player="RED" size="LARGE" cellSize={EFFECTIVE} testID="p" static />,
    );
    const diameter = EFFECTIVE * PIECE_SIZE_RATIO.LARGE;
    const s = flatStyle(getByTestId('p'));
    expect(s.top).toBeCloseTo((EFFECTIVE - diameter) / 2, 5);
  });
});

describe('Piece スタイル — プレイヤーカラー', () => {
  (['RED', 'BLUE', 'YELLOW', 'GREEN'] as const).forEach((player) => {
    it(`${player}: backgroundColor と borderColor が正しい`, () => {
      const { getByTestId } = render(
        <Piece player={player} size="MEDIUM" cellSize={EFFECTIVE} testID="p" static />,
      );
      const s = flatStyle(getByTestId('p'));
      expect(s.backgroundColor).toBe(PLAYER_COLORS[player]);
      expect(s.borderColor).toBe(PLAYER_BORDER_COLORS[player]);
    });
  });
});

describe('Piece スタイル — position: absolute', () => {
  it('position が "absolute"', () => {
    const { getByTestId } = render(
      <Piece player="RED" size="SMALL" cellSize={EFFECTIVE} testID="p" static />,
    );
    const s = flatStyle(getByTestId('p'));
    expect(s.position).toBe('absolute');
  });
});
