import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveActiveGame,
  loadActiveGame,
  clearActiveGame,
} from '../../../src/online/activeGame';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getItem.mockResolvedValue(null);
});

describe('saveActiveGame', () => {
  it('AsyncStorage に gameId・roomCode・savedAt を保存する', async () => {
    await saveActiveGame({ gameId: 'g1', roomCode: 'ABC123' });
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('activeGame'),
      expect.stringContaining('g1'),
    );
  });

  it('color を含む場合も保存できる', async () => {
    await saveActiveGame({ gameId: 'g2', roomCode: 'DEF456', color: 'RED' });
    const raw = mockStorage.setItem.mock.calls[0][1];
    const parsed = JSON.parse(raw);
    expect(parsed.color).toBe('RED');
  });
});

describe('loadActiveGame', () => {
  it('保存済みデータを返す', async () => {
    const payload = { gameId: 'g1', roomCode: 'ABC', savedAt: Date.now() };
    mockStorage.getItem.mockResolvedValue(JSON.stringify(payload));

    const result = await loadActiveGame();
    expect(result).toMatchObject({ gameId: 'g1', roomCode: 'ABC' });
  });

  it('null を返す場合（データなし）', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    const result = await loadActiveGame();
    expect(result).toBeNull();
  });

  it('6時間以上古いエントリを削除して null を返す', async () => {
    const old = { gameId: 'g1', roomCode: 'ABC', savedAt: Date.now() - 7 * 60 * 60 * 1000 };
    mockStorage.getItem.mockResolvedValue(JSON.stringify(old));

    const result = await loadActiveGame();
    expect(result).toBeNull();
    expect(mockStorage.removeItem).toHaveBeenCalled();
  });

  it('gameId または roomCode がない場合は null を返す', async () => {
    const incomplete = { savedAt: Date.now() };
    mockStorage.getItem.mockResolvedValue(JSON.stringify(incomplete));
    const result = await loadActiveGame();
    expect(result).toBeNull();
  });
});

describe('clearActiveGame', () => {
  it('AsyncStorage から削除する', async () => {
    await clearActiveGame();
    expect(mockStorage.removeItem).toHaveBeenCalled();
  });
});
