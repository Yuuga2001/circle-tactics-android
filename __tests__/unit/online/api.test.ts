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

  it('ApiError でコードが不明な場合はコードをそのまま返す', () => {
    const err = new ApiError(400, 'UNKNOWN_CODE');
    expect(friendlyError(err)).toBe('UNKNOWN_CODE');
  });

  it('Error インスタンスはメッセージを返す', () => {
    const err = new Error('Something bad');
    expect(friendlyError(err)).toBe('Something bad');
  });

  it('Error のメッセージが ERROR_MESSAGES に一致するとき翻訳する', () => {
    const err = new Error('NOT_FOUND');
    expect(friendlyError(err)).toBe('Room not found');
  });

  it('不明な型はデフォルトメッセージを返す', () => {
    expect(friendlyError(null)).toBe('Something went wrong');
  });

  it('api.join は previousColor を含めて呼び出す', async () => {
    mockFetch(200, { player: { color: 'RED' }, session: {} });
    await api.join('g1', 'client-1', 'RED');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/join'),
      expect.objectContaining({
        body: expect.stringContaining('"previousColor":"RED"'),
      }),
    );
  });

  it('api.selectSize は POST /select-size を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1' });
    await api.selectSize('g1', 'client-1', 'LARGE');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/select-size'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('api.restart は POST /restart を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1' });
    await api.restart('g1', 'client-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restart'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('api.getByRoomCode は GET /game/by-code/:code を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1' });
    await api.getByRoomCode('123456');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/by-code/123456'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('api.heartbeat は POST /heartbeat を呼び出す', async () => {
    mockFetch(200, { ok: true });
    await api.heartbeat('g1', 'client-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/heartbeat'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('api.start は POST /start を呼び出す', async () => {
    mockFetch(200, { gameId: 'g1', status: 'PLAYING' });
    await api.start('g1', 'client-1', 2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/start'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('空ボディのレスポンスでも ApiError を throw する', async () => {
    const res = { ok: false, status: 500, json: jest.fn().mockRejectedValue(new SyntaxError()) };
    global.fetch = jest.fn().mockResolvedValue(res) as jest.Mock;
    await expect(api.getGame('g1')).rejects.toThrow(ApiError);
  });
});
