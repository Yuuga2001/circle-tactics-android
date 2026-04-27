import { renderHook, act } from '@testing-library/react-native';
import { useBoardDrag } from '../../../src/components/useBoardDrag';

const makeHand = () => ({ S: 4, M: 3, L: 2 });

const makeCellLayouts = () => [
  { row: 0, col: 0, x: 0, y: 0, width: 72, height: 72 },
  { row: 0, col: 1, x: 72, y: 0, width: 72, height: 72 },
  { row: 1, col: 0, x: 0, y: 72, width: 72, height: 72 },
];

const defaultOptions = {
  player: 'RED' as const,
  hand: makeHand(),
  enabled: true,
  onSelectSize: jest.fn(),
  onPlace: jest.fn(),
  cellLayouts: makeCellLayouts(),
};

beforeEach(() => jest.clearAllMocks());

describe('useBoardDrag', () => {
  it('初期状態は draggingSize=null, hoverCell=null', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    expect(result.current.draggingSize).toBeNull();
    expect(result.current.hoverCell).toBeNull();
    expect(result.current.ghost).toBeNull();
  });

  it('enabled=false のとき bindLongPress は空オブジェクトを返す', () => {
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, enabled: false }));
    expect(result.current.bindLongPress('S')).toEqual({});
  });

  it('hand[size]=0 のとき bindLongPress は空オブジェクトを返す', () => {
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, hand: { S: 0, M: 3, L: 2 } }),
    );
    expect(result.current.bindLongPress('S')).toEqual({});
  });

  it('enabled=true, hand[size]>0 のとき bindLongPress はハンドラを返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const handlers = result.current.bindLongPress('S');
    expect(typeof handlers.onLongPress).toBe('function');
    expect(typeof handlers.onResponderMove).toBe('function');
    expect(typeof handlers.onResponderRelease).toBe('function');
    expect(typeof handlers.onStartShouldSetResponder).toBe('function');
    expect(typeof handlers.onMoveShouldSetResponder).toBe('function');
  });

  it('onLongPress で draggingSize がセットされ onSelectSize が呼ばれる', () => {
    const onSelectSize = jest.fn();
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, onSelectSize }));
    const handlers = result.current.bindLongPress('M');
    act(() => { (handlers.onLongPress as () => void)(); });
    expect(onSelectSize).toHaveBeenCalledWith('M');
    expect(result.current.draggingSize).toBe('M');
  });

  it('onResponderMove でセル内座標なら hoverCell が更新される', () => {
    const onSelectSize = jest.fn();
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, onSelectSize }));

    // まず Long press でドラッグ開始
    const handlers = result.current.bindLongPress('S');
    act(() => { (handlers.onLongPress as () => void)(); });

    // セル(0,1) 内の座標でMove
    const updatedHandlers = result.current.bindLongPress('S');
    act(() => {
      (updatedHandlers.onResponderMove as (e: unknown) => void)({
        nativeEvent: { pageX: 100, pageY: 10 },
      });
    });
    expect(result.current.hoverCell).toEqual({ row: 0, col: 1 });
  });

  it('onResponderMove でセル外座標なら hoverCell は null になる', () => {
    const onSelectSize = jest.fn();
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, onSelectSize }));

    const handlers = result.current.bindLongPress('S');
    act(() => { (handlers.onLongPress as () => void)(); });

    const updatedHandlers = result.current.bindLongPress('S');
    act(() => {
      (updatedHandlers.onResponderMove as (e: unknown) => void)({
        nativeEvent: { pageX: 999, pageY: 999 },
      });
    });
    expect(result.current.hoverCell).toBeNull();
  });

  it('onResponderRelease でセル上なら onPlace が呼ばれドラッグ終了', () => {
    const onPlace = jest.fn();
    const onSelectSize = jest.fn();
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, onSelectSize, onPlace }),
    );

    const handlers = result.current.bindLongPress('L');
    act(() => { (handlers.onLongPress as () => void)(); });

    const updatedHandlers = result.current.bindLongPress('L');
    act(() => {
      (updatedHandlers.onResponderRelease as (e: unknown) => void)({
        nativeEvent: { pageX: 36, pageY: 36 },
      });
    });
    expect(onPlace).toHaveBeenCalledWith(0, 0);
    expect(result.current.draggingSize).toBeNull();
    expect(result.current.hoverCell).toBeNull();
  });

  it('onResponderRelease でセル外なら onPlace は呼ばれない', () => {
    const onPlace = jest.fn();
    const onSelectSize = jest.fn();
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, onSelectSize, onPlace }),
    );

    const handlers = result.current.bindLongPress('S');
    act(() => { (handlers.onLongPress as () => void)(); });

    const updatedHandlers = result.current.bindLongPress('S');
    act(() => {
      (updatedHandlers.onResponderRelease as (e: unknown) => void)({
        nativeEvent: { pageX: 999, pageY: 999 },
      });
    });
    expect(onPlace).not.toHaveBeenCalled();
    expect(result.current.draggingSize).toBeNull();
  });

  it('onStartShouldSetResponder は true を返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const handlers = result.current.bindLongPress('S');
    expect((handlers.onStartShouldSetResponder as () => boolean)()).toBe(true);
  });

  it('onMoveShouldSetResponder は true を返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const handlers = result.current.bindLongPress('S');
    expect((handlers.onMoveShouldSetResponder as () => boolean)()).toBe(true);
  });

  it('enabled が false になると draggingSize と hoverCell がリセットされる', () => {
    const onSelectSize = jest.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useBoardDrag({ ...defaultOptions, onSelectSize, enabled }),
      { initialProps: { enabled: true } },
    );

    // drag state set
    const handlers = result.current.bindLongPress('M');
    act(() => { (handlers.onLongPress as () => void)(); });
    expect(result.current.draggingSize).toBe('M');

    // disable
    act(() => { rerender({ enabled: false }); });
    expect(result.current.draggingSize).toBeNull();
    expect(result.current.hoverCell).toBeNull();
  });

  it('ドラッグ中でない時の onResponderMove は何もしない', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const handlers = result.current.bindLongPress('S');
    // onLongPress を呼ばずにMove
    act(() => {
      (handlers.onResponderMove as (e: unknown) => void)({
        nativeEvent: { pageX: 36, pageY: 36 },
      });
    });
    expect(result.current.hoverCell).toBeNull();
  });

  it('ドラッグ中でない時の onResponderRelease は onPlace を呼ばない', () => {
    const onPlace = jest.fn();
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, onPlace }));
    const handlers = result.current.bindLongPress('S');
    act(() => {
      (handlers.onResponderRelease as (e: unknown) => void)({
        nativeEvent: { pageX: 36, pageY: 36 },
      });
    });
    expect(onPlace).not.toHaveBeenCalled();
  });
});
