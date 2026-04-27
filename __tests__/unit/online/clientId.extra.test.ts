import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId } from '../../../src/online/clientId';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getItem.mockResolvedValue(null);
});

describe('getClientId - error branch', () => {
  it('AsyncStorage が例外を投げた場合でも UUID を返す', async () => {
    mockStorage.getItem.mockRejectedValue(new Error('storage error'));
    const id = await getClientId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('crypto.randomUUID が使用できない環境でも UUID を生成する', async () => {
    // Temporarily remove crypto.randomUUID
    const origCrypto = global.crypto;
    // @ts-expect-error override for test
    global.crypto = undefined;

    mockStorage.getItem.mockResolvedValue(null);
    const id = await getClientId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);

    global.crypto = origCrypto;
  });
});
