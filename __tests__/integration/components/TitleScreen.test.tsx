import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TitleScreen from '../../../src/components/TitleScreen';

jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    play: jest.fn(),
    startBGM: jest.fn(),
    stopBGM: jest.fn(),
    setMuted: jest.fn(),
    getMuted: jest.fn().mockReturnValue(false),
    setBgmMuted: jest.fn(),
    setSeMuted: jest.fn(),
    getBgmMuted: jest.fn().mockReturnValue(false),
    getSeMuted: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      pickingFirst: '...',
      goesFirst: (p: string) => p,
      turnYou: 'Your Turn',
      turnPlayer: (p: string) => p,
      playerWins: (p: string) => `${p} WINS!`,
      draw: 'DRAW',
      playAgain: 'Play Again',
      titleBtn: 'Title',
      firstLabel: 'FIRST',
      skipLabel: 'SKIP',
      noMoves: 'No moves',
      aiThinking: (p: string) => p,
      winCell: 'Cell win',
      winRow: '4 in a row!',
      yourHand: 'Hand',
      playerLabel: 'Player',
      aiLabel: 'AI',
      youLabel: 'You',
      soundOn: 'ON',
      soundOff: 'OFF',
      bgmLabel: 'BGM',
      seLabel: 'SE',
      subtitle: 'Subtitle text',
      setSeats: 'Set Seats',
      chooseAtLeastOne: 'Choose at least one player',
      playLocal: 'Play Local',
      playOnline: 'Play Online',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('TitleScreen component', () => {
  it('title-screen が表示される', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    expect(getByTestId('title-screen')).toBeTruthy();
  });

  it('"CircleTactics" の title-text が表示される', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    const titleEl = getByTestId('title-text');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.children).toBe('CircleTactics');
  });

  it('play-local-btn が存在する', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    expect(getByTestId('play-local-btn')).toBeTruthy();
  });

  it('play-online-btn タップで onPlayOnline が呼ばれる', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    fireEvent.press(getByTestId('play-online-btn'));
    expect(onPlayOnline).toHaveBeenCalledTimes(1);
  });

  it('play-local-btn タップで onPlayLocal が人間プレイヤー配列を渡して呼ばれる', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    // デフォルトでREDがhuman
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['RED']);
  });

  it('全4席のシートトグルが存在する', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    ['RED', 'BLUE', 'YELLOW', 'GREEN'].forEach((player) => {
      expect(getByTestId(`seat-toggle-${player}`)).toBeTruthy();
    });
  });

  it('シートをトグルして複数の人間プレイヤーでプレイできる', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    // BLUEをhuman に切り替え
    fireEvent.press(getByTestId('seat-toggle-BLUE'));
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['RED', 'BLUE']);
  });

  it('REDをAIにトグルすると全席AI → 警告テキストが表示される', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId, getByText } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    // デフォルトはRED=human, 他=ai → REDをAIに切り替えで全員AI
    fireEvent.press(getByTestId('seat-toggle-RED'));
    expect(getByText('Choose at least one player')).toBeTruthy();
  });

  it('全席AIのとき play-local-btn を押しても onPlayLocal が呼ばれない', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    fireEvent.press(getByTestId('seat-toggle-RED')); // RED → ai → humanCount=0
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).not.toHaveBeenCalled();
  });

  it('humanをAIに戻せる（double-toggle）', () => {
    const onPlayLocal = jest.fn();
    const onPlayOnline = jest.fn();
    const { getByTestId } = render(
      <TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />,
    );
    // BLUE: ai → human → ai
    fireEvent.press(getByTestId('seat-toggle-BLUE')); // ai→human
    fireEvent.press(getByTestId('seat-toggle-BLUE')); // human→ai
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['RED']); // BLUEは外れる
  });
});
