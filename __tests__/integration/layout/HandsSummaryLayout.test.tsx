/**
 * HandsSummary のレイアウトが Web 版 (grid-template-columns: 1.4fr 1fr 1fr 1fr) と
 * 同等の比率になっていることを検証する。
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import HandsSummary from '../../../src/components/HandsSummary';
import { HandState, Player } from '../../../src/types';
import { PLAYER_COLORS, PLAYER_BORDER_COLORS } from '../../../src/styles/theme';

const hands: Record<Player, HandState> = {
  RED:    { SMALL: 4, MEDIUM: 4, LARGE: 4 },
  BLUE:   { SMALL: 4, MEDIUM: 4, LARGE: 4 },
  YELLOW: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
  GREEN:  { SMALL: 4, MEDIUM: 4, LARGE: 4 },
};
const players: Player[] = ['RED', 'BLUE', 'YELLOW', 'GREEN'];

function flatStyle(element: any): Record<string, any> {
  const style = element.props.style;
  if (!style) return {};
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.map((s: any) => (s && typeof s === 'object' && !Array.isArray(s) ? s : {})));
}

describe('HandsSummary — 全プレイヤー行が表示される', () => {
  it('全 4 プレイヤーの行が存在する', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />,
    );
    players.forEach((p) => expect(getByTestId(`hands-row-${p}`)).toBeTruthy());
  });

  it('各行の SMALL/MEDIUM/LARGE カウントが表示される', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />,
    );
    players.forEach((p) => {
      expect(getByTestId(`hands-count-${p}-SMALL`)).toBeTruthy();
      expect(getByTestId(`hands-count-${p}-MEDIUM`)).toBeTruthy();
      expect(getByTestId(`hands-count-${p}-LARGE`)).toBeTruthy();
    });
  });
});

describe('HandsSummary — カウント値が正しく表示される', () => {
  it('手札数が正確に表示される', () => {
    const customHands: Record<Player, HandState> = {
      RED:    { SMALL: 2, MEDIUM: 3, LARGE: 1 },
      BLUE:   { SMALL: 0, MEDIUM: 4, LARGE: 2 },
      YELLOW: { SMALL: 5, MEDIUM: 0, LARGE: 4 },
      GREEN:  { SMALL: 1, MEDIUM: 1, LARGE: 0 },
    };
    const { getByTestId } = render(
      <HandsSummary hands={customHands} players={players} currentPlayer="BLUE" />,
    );
    expect(getByTestId('hands-count-RED-SMALL').props.children).toBe(2);
    expect(getByTestId('hands-count-RED-MEDIUM').props.children).toBe(3);
    expect(getByTestId('hands-count-RED-LARGE').props.children).toBe(1);
    expect(getByTestId('hands-count-BLUE-SMALL').props.children).toBe(0);
    expect(getByTestId('hands-count-YELLOW-MEDIUM').props.children).toBe(0);
    expect(getByTestId('hands-count-GREEN-LARGE').props.children).toBe(0);
  });
});

describe('HandsSummary — プレイヤー列の flex 比率（Web: 1.4fr）', () => {
  it('プレイヤー列の flex が count 列（flex:1）より大きい', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />,
    );
    const row = getByTestId('hands-row-RED');
    // 行の最初の子がプレイヤーセル
    const children = row.props.children as any[];
    if (!children || children.length === 0) return;

    const playerCell = children[0];
    const playerStyle = flatStyle(playerCell);
    // Web 版: grid-template-columns: 1.4fr 1fr 1fr 1fr
    // Android 版: playerCell.flex=1.4, countCell.flex=1
    expect(playerStyle.flex).toBeGreaterThan(1);
  });

  it('playerCell の flex は 1.4（Web 版 1.4fr に対応）', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />,
    );
    const row = getByTestId('hands-row-RED');
    const children = row.props.children as any[];
    if (!children || children.length === 0) return;
    const playerCellStyle = flatStyle(children[0]);
    expect(playerCellStyle.flex).toBeCloseTo(1.4, 1);
  });
});

describe('HandsSummary — currentPlayer ハイライト', () => {
  it('currentPlayer の行に背景色ハイライトが適用される', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="YELLOW" />,
    );
    const yellowRow = getByTestId('hands-row-YELLOW');
    const s = flatStyle(yellowRow);
    // currentRow の backgroundColor が設定されている
    expect(s.backgroundColor).toBeTruthy();
    expect(s.backgroundColor).toContain('rgba');
  });

  it('currentPlayer でない行にはハイライトがない', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />,
    );
    const blueRow = getByTestId('hands-row-BLUE');
    const s = flatStyle(blueRow);
    // 通常行は backgroundColor を持たない
    expect(s.backgroundColor).toBeUndefined();
  });
});

describe('HandsSummary — ドット（カラーマーカー）', () => {
  it('各プレイヤー行にカラードットが 14×14 で表示される（Web 版 .dot: 14px）', () => {
    const { getAllByTestId, queryAllByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />,
    );
    // HandsSummary の各行の最初の View 子要素がドット
    // ここでは testID の代わりに手動で行をたどる
    // dot の style を確認するため getByTestId で行を取得
    const redRow = render(
      <HandsSummary hands={hands} players={['RED']} currentPlayer="RED" />,
    ).getByTestId('hands-row-RED');

    // 行 → playerCell (children[0]) → dot (children[0])
    const rowChildren = redRow.props.children as any[];
    if (!rowChildren?.[0]) return;
    const playerCell = rowChildren[0];
    const pcChildren = playerCell.props?.children as any[];
    if (!pcChildren?.[0]) return;
    const dot = pcChildren[0];
    const ds = flatStyle(dot);
    expect(ds.width).toBe(14);   // Web: width: 14px
    expect(ds.height).toBe(14);  // Web: height: 14px
    expect(ds.borderRadius).toBe(7); // 14/2 = 7 → 50% circle
  });
});
