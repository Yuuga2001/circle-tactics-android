import {
  PIECE_SIZE_RATIO,
  PIECE_VERTICAL_OFFSET_RATIO,
  PIECE_Z_INDEX,
} from '../../../src/styles/theme';

// Piece.tsx の配置計算ロジックを再現
function calcPieceLayout(cellSize: number, size: 'SMALL' | 'MEDIUM' | 'LARGE') {
  const diameter = cellSize * PIECE_SIZE_RATIO[size];
  const verticalOffset = diameter * PIECE_VERTICAL_OFFSET_RATIO[size];
  const left = (cellSize - diameter) / 2;
  const top = (cellSize - diameter) / 2 + verticalOffset;
  const borderRadius = diameter / 2;
  return { diameter, left, top, borderRadius };
}

// Cell.tsx が Piece に渡す実効サイズ（cellBase の 2px ボーダー × 2 を除いた値）
const CELL_SIZE = 72;
const EFFECTIVE = CELL_SIZE - 4; // 68

describe('Piece サイズ計算', () => {
  it('SMALL < MEDIUM < LARGE の順でサイズが大きい', () => {
    const s = calcPieceLayout(EFFECTIVE, 'SMALL').diameter;
    const m = calcPieceLayout(EFFECTIVE, 'MEDIUM').diameter;
    const l = calcPieceLayout(EFFECTIVE, 'LARGE').diameter;
    expect(s).toBeLessThan(m);
    expect(m).toBeLessThan(l);
  });

  it('全サイズの diameter が 0 より大きくセルサイズ以下', () => {
    (['SMALL', 'MEDIUM', 'LARGE'] as const).forEach((size) => {
      const { diameter } = calcPieceLayout(EFFECTIVE, size);
      expect(diameter).toBeGreaterThan(0);
      expect(diameter).toBeLessThanOrEqual(EFFECTIVE);
    });
  });

  it('borderRadius が diameter の半分（真円）', () => {
    (['SMALL', 'MEDIUM', 'LARGE'] as const).forEach((size) => {
      const { diameter, borderRadius } = calcPieceLayout(EFFECTIVE, size);
      expect(borderRadius).toBeCloseTo(diameter / 2, 10);
    });
  });
});

describe('Piece 水平センタリング', () => {
  it('全サイズがコンテナ中心に水平センタリングされる', () => {
    (['SMALL', 'MEDIUM', 'LARGE'] as const).forEach((size) => {
      const { left, diameter } = calcPieceLayout(EFFECTIVE, size);
      // ピースの中心 x = left + diameter/2 ≈ EFFECTIVE/2
      expect(left + diameter / 2).toBeCloseTo(EFFECTIVE / 2, 5);
    });
  });
});

describe('Piece 垂直オフセット（Web版 translate Y と一致）', () => {
  // Web: SMALL translate(-50%,-80%), MEDIUM translate(-50%,-50%), LARGE translate(-50%,-20%)
  // → SMALL: center < cell center、MEDIUM: center = cell center、LARGE: center > cell center

  it('MEDIUM ピースがセル中央に配置される', () => {
    const { top, diameter } = calcPieceLayout(EFFECTIVE, 'MEDIUM');
    const center = top + diameter / 2;
    expect(center).toBeCloseTo(EFFECTIVE / 2, 5);
  });

  it('SMALL ピースがセル中央に配置される（オフセット 0）', () => {
    const { top, diameter } = calcPieceLayout(EFFECTIVE, 'SMALL');
    const center = top + diameter / 2;
    expect(center).toBeCloseTo(EFFECTIVE / 2, 5);
  });

  it('LARGE ピースがセル中央に配置される（オフセット 0）', () => {
    const { top, diameter } = calcPieceLayout(EFFECTIVE, 'LARGE');
    const center = top + diameter / 2;
    expect(center).toBeCloseTo(EFFECTIVE / 2, 5);
  });

  it('SMALL の top が (EFFECTIVE - dia) / 2 （中央揃え）', () => {
    const dia = EFFECTIVE * PIECE_SIZE_RATIO.SMALL;
    const { top } = calcPieceLayout(EFFECTIVE, 'SMALL');
    expect(top).toBeCloseTo((EFFECTIVE - dia) / 2, 5);
  });

  it('LARGE の top が (EFFECTIVE - dia) / 2 （中央揃え）', () => {
    const dia = EFFECTIVE * PIECE_SIZE_RATIO.LARGE;
    const { top } = calcPieceLayout(EFFECTIVE, 'LARGE');
    expect(top).toBeCloseTo((EFFECTIVE - dia) / 2, 5);
  });
});

describe('Piece z-index 重なり順序', () => {
  it('SMALL が最前面（z-index 最大）', () => {
    expect(PIECE_Z_INDEX.SMALL).toBeGreaterThan(PIECE_Z_INDEX.MEDIUM);
    expect(PIECE_Z_INDEX.SMALL).toBeGreaterThan(PIECE_Z_INDEX.LARGE);
  });

  it('MEDIUM が LARGE より前面', () => {
    expect(PIECE_Z_INDEX.MEDIUM).toBeGreaterThan(PIECE_Z_INDEX.LARGE);
  });

  it('LARGE が最背面（z-index 最小）', () => {
    expect(PIECE_Z_INDEX.LARGE).toBeLessThan(PIECE_Z_INDEX.MEDIUM);
    expect(PIECE_Z_INDEX.LARGE).toBeLessThan(PIECE_Z_INDEX.SMALL);
  });
});

describe('cellSize が変わっても比率は保たれる', () => {
  it('小さいセル(50px)でも大きいセル(100px)でも比率は同じ', () => {
    const sizes = [50, 68, 80, 100] as const;
    sizes.forEach((cell) => {
      const s = calcPieceLayout(cell, 'SMALL').diameter / cell;
      const m = calcPieceLayout(cell, 'MEDIUM').diameter / cell;
      const l = calcPieceLayout(cell, 'LARGE').diameter / cell;
      expect(s).toBeCloseTo(PIECE_SIZE_RATIO.SMALL, 10);
      expect(m).toBeCloseTo(PIECE_SIZE_RATIO.MEDIUM, 10);
      expect(l).toBeCloseTo(PIECE_SIZE_RATIO.LARGE, 10);
    });
  });
});
