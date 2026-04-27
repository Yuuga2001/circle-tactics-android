import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LobbyScreen from '../../../src/components/LobbyScreen';

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      onlinePlay: 'Online Play',
      lobbyDesc: 'Create a room or join with a code.',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      back: '← Back',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LobbyScreen', () => {
  it('lobby-screen が表示される', () => {
    const { getByTestId } = render(
      <LobbyScreen
        onCreateRoom={jest.fn()}
        onJoinRoom={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByTestId('lobby-screen')).toBeTruthy();
  });

  it('create-room-btn を押すと onCreateRoom が呼ばれる', () => {
    const onCreateRoom = jest.fn();
    const { getByTestId } = render(
      <LobbyScreen
        onCreateRoom={onCreateRoom}
        onJoinRoom={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('create-room-btn'));
    expect(onCreateRoom).toHaveBeenCalledTimes(1);
  });

  it('join-room-btn を押すと onJoinRoom が呼ばれる', () => {
    const onJoinRoom = jest.fn();
    const { getByTestId } = render(
      <LobbyScreen
        onCreateRoom={jest.fn()}
        onJoinRoom={onJoinRoom}
        onBack={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('join-room-btn'));
    expect(onJoinRoom).toHaveBeenCalledTimes(1);
  });

  it('Back ボタンを押すと onBack が呼ばれる', () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <LobbyScreen
        onCreateRoom={jest.fn()}
        onJoinRoom={jest.fn()}
        onBack={onBack}
      />,
    );
    fireEvent.press(getByText('← Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('タイトルテキストが表示される', () => {
    const { getByText } = render(
      <LobbyScreen
        onCreateRoom={jest.fn()}
        onJoinRoom={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByText('Online Play')).toBeTruthy();
  });
});
