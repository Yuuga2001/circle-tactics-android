import React from 'react';
import { render } from '@testing-library/react-native';
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
      });
      return null;
    }

    render(<Probe />);
    expect(hookResult).not.toBeNull();
    expect(typeof hookResult!.bindLongPress).toBe('function');
    expect(hookResult!.draggingSize).toBeNull();
    expect(hookResult!.hoverCell).toBeNull();
  });

  it('bindPiecePointerDown: hand[size]=0 のとき空オブジェクトを返す', () => {
    let hookResult: ReturnType<typeof useBoardDrag> | null = null;

    function Probe() {
      hookResult = useBoardDrag({
        player: 'RED',
        hand: { SMALL: 0, MEDIUM: 3, LARGE: 3 },
        enabled: true,
        onSelectSize: mockOnSelectSize,
        onPlace: mockOnPlace,
      });
      return null;
    }

    render(<Probe />);
    expect(hookResult!.bindPiecePointerDown('SMALL')).toEqual({});
    expect(Object.keys(hookResult!.bindPiecePointerDown('MEDIUM')).length).toBeGreaterThan(0);
  });

  it('bindPiecePointerDown: enabled=false のとき空オブジェクトを返す', () => {
    let hookResult: ReturnType<typeof useBoardDrag> | null = null;

    function Probe() {
      hookResult = useBoardDrag({
        player: 'RED',
        hand: { SMALL: 3, MEDIUM: 3, LARGE: 3 },
        enabled: false,
        onSelectSize: mockOnSelectSize,
        onPlace: mockOnPlace,
      });
      return null;
    }

    render(<Probe />);
    expect(hookResult!.bindPiecePointerDown('SMALL')).toEqual({});
    expect(hookResult!.bindPiecePointerDown('MEDIUM')).toEqual({});
  });

  it('ghost は初期状態で null', () => {
    let hookResult: ReturnType<typeof useBoardDrag> | null = null;

    function Probe() {
      hookResult = useBoardDrag({
        player: 'RED',
        hand: { SMALL: 3, MEDIUM: 3, LARGE: 3 },
        enabled: true,
        onSelectSize: mockOnSelectSize,
        onPlace: mockOnPlace,
      });
      return null;
    }

    render(<Probe />);
    expect(hookResult!.ghost).toBeNull();
  });

  it('enabled が true → false に変わると dragging-indicator が消える', () => {
    const { rerender, queryByTestId } = render(<TestComponent enabled={true} />);
    // enabled=false に変更するとドラッグ状態がクリアされる
    rerender(<TestComponent enabled={false} />);
    expect(queryByTestId('dragging-indicator')).toBeNull();
  });

  it('bindLongPress は bindPiecePointerDown と同じ値を返す', () => {
    let hookResult: ReturnType<typeof useBoardDrag> | null = null;

    function Probe() {
      hookResult = useBoardDrag({
        player: 'RED',
        hand: { SMALL: 3, MEDIUM: 3, LARGE: 3 },
        enabled: true,
        onSelectSize: mockOnSelectSize,
        onPlace: mockOnPlace,
      });
      return null;
    }

    render(<Probe />);
    const fromLongPress = hookResult!.bindLongPress('SMALL');
    const fromPointerDown = hookResult!.bindPiecePointerDown('SMALL');
    // 同一オブジェクトまたは同じキーセット
    expect(Object.keys(fromLongPress)).toEqual(Object.keys(fromPointerDown));
  });
});
