import { BOARD_GAP } from '../../../src/styles/theme';

// Board.tsx の cellSize 計算ロジックを再現（onLayout は grid View に対して実行される）
function calcCellSize(gridW: number): number {
  if (gridW <= 0) return 0;
  return Math.floor((gridW - BOARD_GAP * 3) / 4);
}

describe('Board cellSize 計算', () => {
  it('gridW=0 のとき 0 を返す', () => {
    expect(calcCellSize(0)).toBe(0);
  });

  it('負の値のとき 0 を返す', () => {
    expect(calcCellSize(-10)).toBe(0);
  });

  it('gridW=321 のとき cellSize=76 (floor(306/4)=76)', () => {
    // 321 - 3*5 = 306, 306/4 = 76.5 → 76
    expect(calcCellSize(321)).toBe(76);
  });

  it('gridW=336 のとき cellSize=80 (floor(321/4)=80)', () => {
    // 336 - 15 = 321, 321/4 = 80.25 → 80
    expect(calcCellSize(336)).toBe(80);
  });

  it('cellSize は正の整数である', () => {
    const cell = calcCellSize(320);
    expect(cell).toBeGreaterThan(0);
    expect(Number.isInteger(cell)).toBe(true);
  });

  it('4セル + 3ギャップがグリッド幅に収まる（オーバーフローなし）', () => {
    const testWidths = [280, 300, 320, 336, 360, 400, 420];
    for (const w of testWidths) {
      const cell = calcCellSize(w);
      const totalUsed = 4 * cell + 3 * BOARD_GAP;
      expect(totalUsed).toBeLessThanOrEqual(w);
    }
  });

  it('余白（グリッド幅 - 使用幅）は BOARD_GAP 未満である（詰まっている）', () => {
    const testWidths = [280, 320, 336, 360, 400];
    for (const w of testWidths) {
      const cell = calcCellSize(w);
      const totalUsed = 4 * cell + 3 * BOARD_GAP;
      const slack = w - totalUsed;
      // floor により最大 3px（4セル分）の余白が生じる
      expect(slack).toBeGreaterThanOrEqual(0);
      expect(slack).toBeLessThan(4);
    }
  });

  it('gridW が大きいほど cellSize も大きい（単調増加）', () => {
    const widths = [280, 300, 320, 340, 360];
    const cells = widths.map(calcCellSize);
    for (let i = 1; i < cells.length; i++) {
      expect(cells[i]).toBeGreaterThanOrEqual(cells[i - 1]);
    }
  });
});
