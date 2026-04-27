import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId } from '../../../src/online/clientId';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getItem.mockResolvedValue(null);
});

describe('getClientId', () => {
  it('既存の clientId を返す', async () => {
    mockStorage.getItem.mockResolvedValue('existing-id');
    const id = await getClientId();
    expect(id).toBe('existing-id');
  });

  it('なければ新規 UUID を生成して保存する', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    const id = await getClientId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      id,
    );
  });

  it('2回呼ぶと同じ clientId を返す', async () => {
    mockStorage.getItem.mockResolvedValueOnce(null).mockResolvedValueOnce('saved-id');
    const id1 = await getClientId();
    const id2 = await getClientId();
    expect(typeof id1).toBe('string');
    expect(id2).toBe('saved-id');
  });
});
