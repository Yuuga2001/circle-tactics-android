import { renderHook, act } from '@testing-library/react-native';
import { useBoardDrag } from '../../../src/components/useBoardDrag';

const makeHand = () => ({ SMALL: 4, MEDIUM: 3, LARGE: 2 });

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
    expect(result.current.bindLongPress('SMALL')).toEqual({});
  });

  it('hand[size]=0 のとき bindLongPress は空オブジェクトを返す', () => {
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, hand: { SMALL: 0, MEDIUM: 3, LARGE: 2 } }),
    );
    expect(result.current.bindLongPress('SMALL')).toEqual({});
  });

  it('enabled=true, hand[size]>0 のとき bindLongPress はonLongPressハンドラを返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const handlers = result.current.bindLongPress('SMALL');
    expect(typeof handlers.onLongPress).toBe('function');
  });

  it('onLongPress で draggingSize がセットされ onSelectSize が呼ばれる', () => {
    const onSelectSize = jest.fn();
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, onSelectSize }));
    const handlers = result.current.bindLongPress('MEDIUM');
    act(() => { (handlers.onLongPress as () => void)(); });
    expect(onSelectSize).toHaveBeenCalledWith('MEDIUM');
    expect(result.current.draggingSize).toBe('MEDIUM');
  });

  it('hoverCell は初期 null', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    expect(result.current.hoverCell).toBeNull();
  });

  it('ghost は常に null', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    expect(result.current.ghost).toBeNull();
  });

  it('bindPiecePointerDown は bindLongPress と同じ結果を返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const lpHandlers = result.current.bindLongPress('SMALL');
    const ppHandlers = result.current.bindPiecePointerDown('SMALL');
    expect(typeof lpHandlers.onLongPress).toBe(typeof ppHandlers.onLongPress);
  });

  it('enabled が false になると draggingSize がリセットされる', () => {
    const onSelectSize = jest.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useBoardDrag({ ...defaultOptions, onSelectSize, enabled }),
      { initialProps: { enabled: true } },
    );

    // drag state set
    const handlers = result.current.bindLongPress('MEDIUM');
    act(() => { (handlers.onLongPress as () => void)(); });
    expect(result.current.draggingSize).toBe('MEDIUM');

    // disable
    act(() => { rerender({ enabled: false }); });
    expect(result.current.draggingSize).toBeNull();
  });

  it('hand が全てゼロのとき全サイズで空オブジェクトを返す', () => {
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, hand: { SMALL: 0, MEDIUM: 0, LARGE: 0 } }),
    );
    expect(result.current.bindLongPress('SMALL')).toEqual({});
    expect(result.current.bindLongPress('MEDIUM')).toEqual({});
    expect(result.current.bindLongPress('LARGE')).toEqual({});
  });
});
