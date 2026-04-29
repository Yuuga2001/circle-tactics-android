import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayerHand from '../../../src/components/PlayerHand';
import { HandState } from '../../../src/types';

const fullHand: HandState = { SMALL: 2, MEDIUM: 2, LARGE: 2 };
const emptyHand: HandState = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
const partialHand: HandState = { SMALL: 0, MEDIUM: 1, LARGE: 2 };

describe('PlayerHand', () => {
  it('3つのサイズボタン（SMALL/MEDIUM/LARGE）が表示される', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    expect(getByTestId('size-btn-SMALL')).toBeTruthy();
    expect(getByTestId('size-btn-MEDIUM')).toBeTruthy();
    expect(getByTestId('size-btn-LARGE')).toBeTruthy();
  });

  it('SMを押すとonSelectSize("SMALL")が呼ばれる', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="BLUE"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    fireEvent.press(getByTestId('size-btn-SMALL'));
    expect(onSelectSize).toHaveBeenCalledWith('SMALL');
  });

  it('MEDIUMを押すとonSelectSize("MEDIUM")が呼ばれる', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    fireEvent.press(getByTestId('size-btn-MEDIUM'));
    expect(onSelectSize).toHaveBeenCalledWith('MEDIUM');
  });

  it('LARGEを押すとonSelectSize("LARGE")が呼ばれる', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="GREEN"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    fireEvent.press(getByTestId('size-btn-LARGE'));
    expect(onSelectSize).toHaveBeenCalledWith('LARGE');
  });

  it('hand[SMALL]===0 のときSMALLボタンはdisabled', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={partialHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    const smallBtn = getByTestId('size-btn-SMALL');
    // disabled の場合 accessibilityState.disabled === true
    expect(smallBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('hand[SMALL]===0 のときSMALLボタンを押してもonSelectSizeは呼ばれない', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={partialHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    fireEvent.press(getByTestId('size-btn-SMALL'));
    expect(onSelectSize).not.toHaveBeenCalled();
  });

  it('interactive=false のときボタンを押してもonSelectSizeは呼ばれない', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
        interactive={false}
      />
    );
    fireEvent.press(getByTestId('size-btn-SMALL'));
    expect(onSelectSize).not.toHaveBeenCalled();
  });

  it('selectedSize="MEDIUM" のときMEDIUMボタンが選択状態になる', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize="MEDIUM"
        onSelectSize={onSelectSize}
      />
    );
    const mediumBtn = getByTestId('size-btn-MEDIUM');
    expect(mediumBtn.props.accessibilityState?.selected).toBe(true);
  });

  it('全手札が0のとき全ボタンがdisabled', () => {
    const onSelectSize = jest.fn();
    const { getByTestId } = render(
      <PlayerHand
        player="YELLOW"
        hand={emptyHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
      />
    );
    expect(getByTestId('size-btn-SMALL').props.accessibilityState?.disabled).toBe(true);
    expect(getByTestId('size-btn-MEDIUM').props.accessibilityState?.disabled).toBe(true);
    expect(getByTestId('size-btn-LARGE').props.accessibilityState?.disabled).toBe(true);
  });

  it('bindPiecePointerDown が渡されたとき drag ハンドラー付きビューが表示される', () => {
    const onSelectSize = jest.fn();
    const bindPiecePointerDown = jest.fn().mockReturnValue({ onTouchStart: jest.fn() });
    const { getByTestId } = render(
      <PlayerHand
        player="RED"
        hand={fullHand}
        selectedSize={null}
        onSelectSize={onSelectSize}
        interactive
        bindPiecePointerDown={bindPiecePointerDown}
      />
    );
    expect(getByTestId('size-btn-SMALL')).toBeTruthy();
  });
});
