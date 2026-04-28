/**
 * PlayerHand のプレビュー円サイズが Web 版
 * (.piecePreview.small: 20px, .medium: 36px, .large: 56px)
 * と一致することを検証する。
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import PlayerHand from '../../../src/components/PlayerHand';
import { HandState, PieceSize } from '../../../src/types';
import { PLAYER_COLORS, PLAYER_BORDER_COLORS } from '../../../src/styles/theme';

// Web 版 PlayerHand.module.css の .piecePreview サイズ
const WEB_PREVIEW_SIZES: Record<PieceSize, number> = {
  SMALL: 20,
  MEDIUM: 36,
  LARGE: 56,
};

const fullHand: HandState = { SMALL: 5, MEDIUM: 5, LARGE: 5 };

function flatStyle(element: any): Record<string, any> {
  const style = element.props.style;
  if (!style) return {};
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.map((s: any) => (s && typeof s === 'object' && !Array.isArray(s) ? s : {})));
}

describe('PlayerHand — プレビュー円サイズ（Web 版との一致）', () => {
  (['SMALL', 'MEDIUM', 'LARGE'] as PieceSize[]).forEach((size) => {
    it(`${size} プレビュー円が Web 版と同じ ${WEB_PREVIEW_SIZES[size]}px`, () => {
      const { getByTestId } = render(
        <PlayerHand
          player="RED"
          hand={fullHand}
          selectedSize={null}
          onSelectSize={jest.fn()}
        />,
      );
      const circle = getByTestId(`piece-preview-${size}`);
      const s = flatStyle(circle);
      expect(s.width).toBe(WEB_PREVIEW_SIZES[size]);
      expect(s.height).toBe(WEB_PREVIEW_SIZES[size]);
    });

    it(`${size} プレビュー円が真円（borderRadius = ${WEB_PREVIEW_SIZES[size] / 2}px）`, () => {
      const { getByTestId } = render(
        <PlayerHand
          player="RED"
          hand={fullHand}
          selectedSize={null}
          onSelectSize={jest.fn()}
        />,
      );
      const circle = getByTestId(`piece-preview-${size}`);
      const s = flatStyle(circle);
      expect(s.borderRadius).toBe(WEB_PREVIEW_SIZES[size] / 2);
    });
  });

  it('SMALL < MEDIUM < LARGE の順でサイズが増加する', () => {
    const { getByTestId } = render(
      <PlayerHand
        player="BLUE"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={jest.fn()}
      />,
    );
    const s = flatStyle(getByTestId('piece-preview-SMALL')).width;
    const m = flatStyle(getByTestId('piece-preview-MEDIUM')).width;
    const l = flatStyle(getByTestId('piece-preview-LARGE')).width;
    expect(s).toBeLessThan(m);
    expect(m).toBeLessThan(l);
  });
});

describe('PlayerHand — プレイヤーカラー（Web 版との一致）', () => {
  (['RED', 'BLUE', 'YELLOW', 'GREEN'] as const).forEach((player) => {
    it(`${player}: プレビュー円の backgroundColor が PLAYER_COLORS と一致`, () => {
      const { getByTestId } = render(
        <PlayerHand
          player={player}
          hand={fullHand}
          selectedSize={null}
          onSelectSize={jest.fn()}
        />,
      );
      const s = flatStyle(getByTestId('piece-preview-MEDIUM'));
      expect(s.backgroundColor).toBe(PLAYER_COLORS[player]);
      expect(s.borderColor).toBe(PLAYER_BORDER_COLORS[player]);
    });
  });

  it('プレビュー円の borderWidth が 3（Web 版 border: 3px solid と一致）', () => {
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={jest.fn()}
      />,
    );
    const s = flatStyle(getByTestId('piece-preview-SMALL'));
    expect(s.borderWidth).toBe(3);
  });
});

describe('PlayerHand — インタラクション', () => {
  it('3 つのサイズボタンすべてが表示される', () => {
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={jest.fn()}
      />,
    );
    expect(getByTestId('size-btn-SMALL')).toBeTruthy();
    expect(getByTestId('size-btn-MEDIUM')).toBeTruthy();
    expect(getByTestId('size-btn-LARGE')).toBeTruthy();
  });

  it('手札 0 のサイズが disabled になる', () => {
    const hand: HandState = { SMALL: 0, MEDIUM: 3, LARGE: 3 };
    const { getByTestId } = render(
      <PlayerHand player="RED" hand={hand} selectedSize={null} onSelectSize={jest.fn()} />,
    );
    expect(getByTestId('size-btn-SMALL').props.accessibilityState?.disabled).toBe(true);
    expect(getByTestId('size-btn-MEDIUM').props.accessibilityState?.disabled).toBeFalsy();
  });
});
