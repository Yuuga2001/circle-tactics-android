import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { useBoardDrag } from '../../../src/components/useBoardDrag';

const mockOnSelectSize = jest.fn();
const mockOnPlace = jest.fn();

function TestComponent({ enabled = true }: { enabled?: boolean }) {
  const { draggingSize, hoverCell, bindLongPress } = useBoardDrag({
    player: 'RED',
    hand: { SMALL: 3, MEDIUM: 3, LARGE: 3 },
    enabled,
    onSelectSize: mockOnSelectSize,
    onPlace: mockOnPlace,
    cellLayouts: [],
  });

  const handlers = bindLongPress('SMALL');

  return (
    <View testID="container">
      <View
        testID="piece-small"
        {...handlers}
      />
      {draggingSize && <View testID="dragging-indicator" />}
      {hoverCell && <View testID="hover-indicator" />}
    </View>
  );
}

describe('useBoardDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態: draggingSize が null', () => {
    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId('dragging-indicator')).toBeNull();
  });

  it('enabled=false のとき bindLongPress が返す handlers がある', () => {
    const { getByTestId } = render(<TestComponent enabled={false} />);
    expect(getByTestId('piece-small')).toBeTruthy();
  });

  it('hoverCell は初期 null', () => {
    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId('hover-indicator')).toBeNull();
  });

  it('useBoardDrag フックが正しいインターフェイスを返す', () => {
    let hookResult: ReturnType<typeof useBoardDrag> | null = null;

    function Probe() {
      hookResult = useBoardDrag({
        player: 'RED',
        hand: { SMALL: 3, MEDIUM: 3, LARGE: 3 },
        enabled: true,
        onSelectSize: mockOnSelectSize,
        onPlace: mockOnPlace,
        cellLayouts: [],
      });
      return null;
    }

    render(<Probe />);
    expect(hookResult).not.toBeNull();
    expect(typeof hookResult!.bindLongPress).toBe('function');
    expect(hookResult!.draggingSize).toBeNull();
    expect(hookResult!.hoverCell).toBeNull();
  });
});
