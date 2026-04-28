import React from 'react';
import { render } from '@testing-library/react-native';
import Cell from '../../../src/components/Cell';
import { CellState } from '../../../src/types';
import { PIECE_SIZE_RATIO } from '../../../src/styles/theme';

const emptyCell: CellState = [null, null, null];

function flatStyle(element: any): Record<string, any> {
  const style = element.props.style;
  if (!style) return {};
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.map((s: any) => (s && typeof s === 'object' && !Array.isArray(s) ? s : {})));
}

describe('Cell レイアウト — 寸法', () => {
  it('Pressable の width/height が cellSize と一致する', () => {
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={emptyCell} onPress={jest.fn()} cellSize={72} />,
    );
    const s = flatStyle(getByTestId('cell-0-0'));
    expect(s.width).toBe(72);
    expect(s.height).toBe(72);
  });

  it('cellSize=80 のとき width/height が 80', () => {
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={emptyCell} onPress={jest.fn()} cellSize={80} />,
    );
    const s = flatStyle(getByTestId('cell-0-0'));
    expect(s.width).toBe(80);
    expect(s.height).toBe(80);
  });

  it('width と height が常に等しい（正方形）', () => {
    [60, 72, 80, 90].forEach((size) => {
      const { getByTestId, unmount } = render(
        <Cell row={0} col={0} cell={emptyCell} onPress={jest.fn()} cellSize={size} />,
      );
      const s = flatStyle(getByTestId('cell-0-0'));
      expect(s.width).toBe(s.height);
      unmount();
    });
  });
});

describe('Cell レイアウト — ピースの testID', () => {
  it('SMALL ピースが piece-{row}-{col}-small の testID で表示される', () => {
    const cell: CellState = [{ player: 'RED', size: 'SMALL' }, null, null];
    const { getByTestId } = render(
      <Cell row={2} col={3} cell={cell} onPress={jest.fn()} cellSize={72} />,
    );
    expect(getByTestId('piece-2-3-small')).toBeTruthy();
  });

  it('MEDIUM ピースが piece-{row}-{col}-medium の testID で表示される', () => {
    const cell: CellState = [null, { player: 'BLUE', size: 'MEDIUM' }, null];
    const { getByTestId } = render(
      <Cell row={1} col={1} cell={cell} onPress={jest.fn()} cellSize={72} />,
    );
    expect(getByTestId('piece-1-1-medium')).toBeTruthy();
  });

  it('LARGE ピースが piece-{row}-{col}-large の testID で表示される', () => {
    const cell: CellState = [null, null, { player: 'GREEN', size: 'LARGE' }];
    const { getByTestId } = render(
      <Cell row={3} col={0} cell={cell} onPress={jest.fn()} cellSize={72} />,
    );
    expect(getByTestId('piece-3-0-large')).toBeTruthy();
  });

  it('全 3 ピースが同一セルに表示される', () => {
    const cell: CellState = [
      { player: 'RED', size: 'SMALL' },
      { player: 'BLUE', size: 'MEDIUM' },
      { player: 'YELLOW', size: 'LARGE' },
    ];
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={cell} onPress={jest.fn()} cellSize={72} />,
    );
    expect(getByTestId('piece-0-0-small')).toBeTruthy();
    expect(getByTestId('piece-0-0-medium')).toBeTruthy();
    expect(getByTestId('piece-0-0-large')).toBeTruthy();
  });
});

describe('Cell レイアウト — ピースサイズが cellSize に追従する', () => {
  it('SMALL ピースの幅が (cellSize-4) × 0.33 と一致する', () => {
    const CELL_SIZE = 80;
    const cell: CellState = [{ player: 'RED', size: 'SMALL' }, null, null];
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={cell} onPress={jest.fn()} cellSize={CELL_SIZE} />,
    );
    const effective = CELL_SIZE - 4;
    const expected = effective * PIECE_SIZE_RATIO.SMALL;
    const s = flatStyle(getByTestId('piece-0-0-small'));
    expect(s.width).toBeCloseTo(expected, 5);
  });

  it('LARGE ピースの幅が (cellSize-4) × 0.96 と一致する', () => {
    const CELL_SIZE = 80;
    const cell: CellState = [null, null, { player: 'GREEN', size: 'LARGE' }];
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={cell} onPress={jest.fn()} cellSize={CELL_SIZE} />,
    );
    const effective = CELL_SIZE - 4;
    const expected = effective * PIECE_SIZE_RATIO.LARGE;
    const s = flatStyle(getByTestId('piece-0-0-large'));
    expect(s.width).toBeCloseTo(expected, 5);
  });

  it('cellSize が変わるとピースサイズも変わる', () => {
    const cellA = 72;
    const cellB = 80;
    const cell: CellState = [null, { player: 'RED', size: 'MEDIUM' }, null];

    const { getByTestId: getA, unmount: unmountA } = render(
      <Cell row={0} col={0} cell={cell} onPress={jest.fn()} cellSize={cellA} />,
    );
    const sA = flatStyle(getA('piece-0-0-medium'));

    unmountA();

    const { getByTestId: getB } = render(
      <Cell row={0} col={0} cell={cell} onPress={jest.fn()} cellSize={cellB} />,
    );
    const sB = flatStyle(getB('piece-0-0-medium'));

    expect(sB.width).toBeGreaterThan(sA.width);
  });
});
