import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import JoinScreen from '../../../src/components/JoinScreen';
import type { GameSession } from '../../../src/online/types';

// ── モック定義 ────────────────────────────────────────────────────────────────

const mockGetByRoomCode = jest.fn();
const mockJoin = jest.fn();
const mockGetGame = jest.fn();

jest.mock('../../../src/online/api', () => ({
  api: {
    getByRoomCode: (...args: unknown[]) => mockGetByRoomCode(...args),
    join: (...args: unknown[]) => mockJoin(...args),
    getGame: (...args: unknown[]) => mockGetGame(...args),
  },
  friendlyError: (e: unknown) => (e instanceof Error ? e.message : 'error'),
}));

jest.mock('../../../src/online/activeGame', () => ({
  saveActiveGame: jest.fn(),
  clearActiveGame: jest.fn(),
}));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      back: 'Back',
      cancel: 'Cancel',
      leave: 'Leave',
      joinTitle: 'Join Room',
      joinDesc: 'Enter 6-digit code',
      joinBtn: 'Join',
      joining: 'Joining...',
      enterCode: 'Enter a valid code',
    },
  }),
}));

// ── ヘルパー ─────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    gameId: 'g1',
    roomCode: '123456',
    status: 'WAITING',
    hostClientId: 'client-host',
    players: [
      {
        clientId: 'client-1',
        color: 'RED',
        lastActiveAt: new Date().toISOString(),
        isHuman: true,
      },
    ],
    humanCount: 1,
    selectedSize: null,
    currentPlayer: 'RED',
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    board: Array(4).fill(null).map(() =>
      Array(4).fill(null).map(() => [null, null, null] as [null, null, null])
    ) as GameSession['board'],
    hands: {
      RED: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      BLUE: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      YELLOW: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      GREEN: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
    },
    winner: null,
    winInfo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
    currentTurnStartedAt: null,
    waitQueue: [],
    version: 1,
    ...overrides,
  };
}

// ── テスト ───────────────────────────────────────────────────────────────────

describe('JoinScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetByRoomCode.mockResolvedValue({ gameId: 'g1' });
    mockJoin.mockResolvedValue({
      you: { clientId: 'client-1', color: 'RED' },
      players: [{ clientId: 'client-1', color: 'RED', lastActiveAt: new Date().toISOString(), isHuman: true }],
      status: 'WAITING',
    });
    mockGetGame.mockResolvedValue(makeSession());
  });

  it('join-screen が表示される', () => {
    const { getByTestId } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByTestId('join-screen')).toBeTruthy();
  });

  it('initialCode が渡されると TextInput に pre-filled される', () => {
    const { getByTestId } = render(
      <JoinScreen
        clientId="client-1"
        initialCode="999999"
        onJoined={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    const input = getByTestId('code-input');
    expect(input.props.value).toBe('999999');
  });

  it('TextInput にコードを入力できる', () => {
    const { getByTestId } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    const input = getByTestId('code-input');
    fireEvent.changeText(input, '654321');
    expect(input.props.value).toBe('654321');
  });

  it('6桁のコードを入力して join ボタンを押すと api.getByRoomCode と api.join が呼ばれる', async () => {
    const { getByTestId } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    fireEvent.changeText(getByTestId('code-input'), '123456');

    await act(async () => {
      fireEvent.press(getByTestId('join-btn'));
    });

    expect(mockGetByRoomCode).toHaveBeenCalledWith('123456');
    expect(mockJoin).toHaveBeenCalledWith('g1', 'client-1');
  });

  it('join 成功後に onJoined が呼ばれる', async () => {
    const onJoined = jest.fn();
    const session = makeSession();
    mockGetGame.mockResolvedValue(session);

    const { getByTestId } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={onJoined}
        onBack={jest.fn()}
      />,
    );

    fireEvent.changeText(getByTestId('code-input'), '123456');

    await act(async () => {
      fireEvent.press(getByTestId('join-btn'));
    });

    await waitFor(() => {
      expect(onJoined).toHaveBeenCalledWith('g1', session);
    });
  });

  it('api 失敗時にエラーメッセージが表示される', async () => {
    mockGetByRoomCode.mockRejectedValue(new Error('Room not found'));

    const { getByTestId, findByText } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    fireEvent.changeText(getByTestId('code-input'), '999999');

    await act(async () => {
      fireEvent.press(getByTestId('join-btn'));
    });

    expect(await findByText('Room not found')).toBeTruthy();
  });

  it('5桁以下のコードで join ボタンを押すとエラーメッセージが表示される', async () => {
    const { getByTestId, findByText } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    fireEvent.changeText(getByTestId('code-input'), '123');

    // join-btn は disabled になっているので直接 submit を通じた動作確認が難しい
    // onSubmitEditing を使う
    await act(async () => {
      fireEvent(getByTestId('code-input'), 'submitEditing');
    });

    expect(await findByText('Enter a valid code')).toBeTruthy();
  });

  it('cancel/back ボタンを押すと onBack が呼ばれる', () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <JoinScreen
        clientId="client-1"
        onJoined={jest.fn()}
        onBack={onBack}
      />,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('initialCode が6桁なら自動的に submit される', async () => {
    const onJoined = jest.fn();
    const session = makeSession();
    mockGetGame.mockResolvedValue(session);

    render(
      <JoinScreen
        clientId="client-1"
        initialCode="123456"
        onJoined={onJoined}
        onBack={jest.fn()}
      />,
    );

    await act(async () => {});

    await waitFor(() => {
      expect(mockGetByRoomCode).toHaveBeenCalledWith('123456');
    });
  });
});
