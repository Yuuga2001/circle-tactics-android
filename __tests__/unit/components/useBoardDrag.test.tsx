import { renderHook, act } from '@testing-library/react-native';
import { useBoardDrag } from '../../../src/components/useBoardDrag';

const makeHand = () => ({ SMALL: 4, MEDIUM: 3, LARGE: 2 });

const makeBoardLayout = () => ({
  pageX: 10,
  pageY: 100,
  cellSize: 68,
});

const defaultOptions = {
  player: 'RED' as const,
  hand: makeHand(),
  enabled: true,
  onSelectSize: jest.fn(),
  onPlace: jest.fn(),
  boardLayout: makeBoardLayout(),
};

beforeEach(() => jest.clearAllMocks());

describe('useBoardDrag', () => {
  it('初期状態は draggingSize=null, hoverCell=null, ghost=null', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    expect(result.current.draggingSize).toBeNull();
    expect(result.current.hoverCell).toBeNull();
    expect(result.current.ghost).toBeNull();
  });

  it('enabled=false のとき bindPiecePointerDown は空オブジェクトを返す', () => {
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, enabled: false }));
    expect(result.current.bindPiecePointerDown('SMALL')).toEqual({});
  });

  it('enabled=false のとき bindLongPress は空オブジェクトを返す', () => {
    const { result } = renderHook(() => useBoardDrag({ ...defaultOptions, enabled: false }));
    expect(result.current.bindLongPress('SMALL')).toEqual({});
  });

  it('hand[size]=0 のとき bindPiecePointerDown は空オブジェクトを返す', () => {
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, hand: { SMALL: 0, MEDIUM: 3, LARGE: 2 } }),
    );
    expect(result.current.bindPiecePointerDown('SMALL')).toEqual({});
  });

  it('enabled=true, hand[size]>0 のとき bindPiecePointerDown はパンハンドラを返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const handlers = result.current.bindPiecePointerDown('SMALL');
    expect(Object.keys(handlers).length).toBeGreaterThan(0);
  });

  it('bindLongPress は bindPiecePointerDown と同じオブジェクトを返す', () => {
    const { result } = renderHook(() => useBoardDrag(defaultOptions));
    const h1 = result.current.bindPiecePointerDown('SMALL');
    const h2 = result.current.bindLongPress('SMALL');
    expect(h1).toBe(h2);
  });

  it('enabled が false になると draggingSize が null', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useBoardDrag({ ...defaultOptions, enabled }),
      { initialProps: { enabled: true } },
    );
    act(() => { rerender({ enabled: false }); });
    expect(result.current.draggingSize).toBeNull();
  });

  it('hand が全てゼロのとき全サイズで空オブジェクトを返す', () => {
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, hand: { SMALL: 0, MEDIUM: 0, LARGE: 0 } }),
    );
    expect(result.current.bindPiecePointerDown('SMALL')).toEqual({});
    expect(result.current.bindPiecePointerDown('MEDIUM')).toEqual({});
    expect(result.current.bindPiecePointerDown('LARGE')).toEqual({});
  });

  it('boardLayout=null でも bindPiecePointerDown はパンハンドラを返す', () => {
    const { result } = renderHook(() =>
      useBoardDrag({ ...defaultOptions, boardLayout: null }),
    );
    const handlers = result.current.bindPiecePointerDown('MEDIUM');
    expect(Object.keys(handlers).length).toBeGreaterThan(0);
  });
});
