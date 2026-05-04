import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage を手動モック
const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStore[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStore[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStore[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    return Promise.resolve();
  }),
}));

import {
  loadSoloRecords,
  appendSoloRecord,
  useSoloRecords,
  formatRecordDate,
  SoloRecord,
} from '../../../src/hooks/useSoloRecords';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  // mockStore をクリア
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  jest.clearAllMocks();
  // モック実装を再設定（clearAllMocks で消えるため）
  mockAsyncStorage.getItem.mockImplementation((key: string) =>
    Promise.resolve(mockStore[key] ?? null)
  );
  mockAsyncStorage.setItem.mockImplementation((key: string, value: string) => {
    mockStore[key] = value;
    return Promise.resolve();
  });
});

// ─────────────────────────────────────────────
// loadSoloRecords
// ─────────────────────────────────────────────
describe('loadSoloRecords()', () => {
  it('AsyncStorage が空のとき空配列を返す', async () => {
    const result = await loadSoloRecords();
    expect(result).toEqual([]);
  });

  it('保存済みデータがあるとき正しくデシリアライズして返す', async () => {
    const records: SoloRecord[] = [
      { id: 'abc', date: '2024-01-01T00:00:00.000Z', isWin: true },
      { id: 'def', date: '2024-01-02T00:00:00.000Z', isWin: false },
    ];
    mockStore['soloRecords'] = JSON.stringify(records);

    const result = await loadSoloRecords();
    expect(result).toEqual(records);
  });

  it('壊れたJSONのとき空配列を返す', async () => {
    mockStore['soloRecords'] = 'not-valid-json{{{';

    const result = await loadSoloRecords();
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// appendSoloRecord
// ─────────────────────────────────────────────
describe('appendSoloRecord(isWin: boolean)', () => {
  it('勝利を追加すると isWin=true のレコードが保存される', async () => {
    await appendSoloRecord(true);

    const saved = JSON.parse(mockStore['soloRecords']) as SoloRecord[];
    expect(saved).toHaveLength(1);
    expect(saved[0].isWin).toBe(true);
  });

  it('敗北を追加すると isWin=false のレコードが保存される', async () => {
    await appendSoloRecord(false);

    const saved = JSON.parse(mockStore['soloRecords']) as SoloRecord[];
    expect(saved).toHaveLength(1);
    expect(saved[0].isWin).toBe(false);
  });

  it('既存レコードに追記される（上書きしない）', async () => {
    const existing: SoloRecord[] = [
      { id: 'existing-1', date: '2024-01-01T00:00:00.000Z', isWin: true },
    ];
    mockStore['soloRecords'] = JSON.stringify(existing);

    await appendSoloRecord(false);

    const saved = JSON.parse(mockStore['soloRecords']) as SoloRecord[];
    expect(saved).toHaveLength(2);
    expect(saved[0].id).toBe('existing-1');
    expect(saved[1].isWin).toBe(false);
  });

  it('各レコードに id と date が含まれる', async () => {
    await appendSoloRecord(true);

    const saved = JSON.parse(mockStore['soloRecords']) as SoloRecord[];
    expect(saved[0]).toHaveProperty('id');
    expect(saved[0]).toHaveProperty('date');
    expect(typeof saved[0].id).toBe('string');
    expect(typeof saved[0].date).toBe('string');
    // date は ISO 文字列であること
    expect(() => new Date(saved[0].date).toISOString()).not.toThrow();
  });
});

// ─────────────────────────────────────────────
// useSoloRecords フック
// ─────────────────────────────────────────────
describe('useSoloRecords() フック', () => {
  it('初期状態で records=[] が返る', () => {
    const { result } = renderHook(() => useSoloRecords());
    expect(result.current.records).toEqual([]);
  });

  it('refresh() を呼ぶとストレージから再取得する', async () => {
    const stored: SoloRecord[] = [
      { id: 'r1', date: '2024-03-15T10:30:00.000Z', isWin: true },
    ];
    mockStore['soloRecords'] = JSON.stringify(stored);

    const { result } = renderHook(() => useSoloRecords());

    // 初期は空
    expect(result.current.records).toEqual([]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.records).toEqual(stored);
  });

  it('refresh() 関数が返される', () => {
    const { result } = renderHook(() => useSoloRecords());
    expect(typeof result.current.refresh).toBe('function');
  });
});

// ─────────────────────────────────────────────
// formatRecordDate
// ─────────────────────────────────────────────
describe('formatRecordDate()', () => {
  it('ISO文字列を "yyyy/MM/dd HH:mm" 形式に変換する', () => {
    // タイムゾーンに依存しないよう、ローカル時刻で固定する
    const date = new Date(2024, 2, 15, 9, 5); // 2024-03-15 09:05 (ローカル)
    const iso = date.toISOString();
    // 期待値もローカル時刻で組み立てる
    const expected = `2024/03/${String(date.getDate()).padStart(2, '0')} 09:05`;
    expect(formatRecordDate(iso)).toBe(expected);
  });

  it('月・日・時・分を2桁にゼロパディングする', () => {
    const date = new Date(2023, 0, 5, 8, 3); // 2023-01-05 08:03 (ローカル)
    const iso = date.toISOString();
    const result = formatRecordDate(iso);
    expect(result).toMatch(/^\d{4}\/01\/05 08:03$/);
  });

  it('12月31日の変換が正しい', () => {
    const date = new Date(2025, 11, 31, 23, 59); // 2025-12-31 23:59 (ローカル)
    const iso = date.toISOString();
    const result = formatRecordDate(iso);
    expect(result).toMatch(/^\d{4}\/12\/31 23:59$/);
  });
});
