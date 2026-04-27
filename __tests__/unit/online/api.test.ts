import { api, ApiError, friendlyError } from '../../../src/online/api';

const mockFetch = (status: number, body: unknown) => {
  const json = jest.fn().mockResolvedValue(body);
  const res = { ok: status >= 200 && status < 300, status, json };
  global.fetch = jest.fn().mockResolvedValue(res) as jest.Mock;
  return res;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('api.createGame', () => {
  it('POST /game を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1', roomCode: 'ABC' });
    await api.createGame('client-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/game'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('api.join', () => {
  it('POST /game/:id/join を呼び出す', async () => {
    mockFetch(200, { player: { color: 'RED' }, session: {} });
    await api.join('g1', 'client-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/join'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('api.getGame', () => {
  it('GET /game/:id を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1' });
    await api.getGame('g1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/game/g1'),
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('api.placePiece', () => {
  it('POST /game/:id/place-piece を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1' });
    await api.placePiece('g1', 'client-1', 0, 0);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/place-piece'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('api.leave', () => {
  it('POST /game/:id/leave を呼び出す', async () => {
    mockFetch(200, { ok: true });
    await api.leave('g1', 'client-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/leave'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('ApiError', () => {
  it('4xx エラーで ApiError が throw される', async () => {
    mockFetch(404, { error: 'NOT_FOUND' });
    await expect(api.getGame('g1')).rejects.toThrow(ApiError);
  });

  it('エラーコードが設定される', async () => {
    mockFetch(404, { error: 'NOT_FOUND' });
    await expect(api.getGame('g1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('friendlyError', () => {
  it('ApiError のコードを翻訳する', () => {
    const err = new ApiError(404, 'NOT_FOUND');
    expect(friendlyError(err)).toBe('Room not found');
  });

  it('Error インスタンスはメッセージを返す', () => {
    const err = new Error('Something bad');
    expect(friendlyError(err)).toBe('Something bad');
  });

  it('不明な型はデフォルトメッセージを返す', () => {
    expect(friendlyError(null)).toBe('Something went wrong');
  });
});
