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
      start: 'Start',
      back: '← Back',
      rule3: 'Take turns on the same device.',
      howToPlayTitle: 'How to Play',
      rule1: 'Rule 1',
      rule2: 'Rule 2',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// helpers
function renderTitle() {
  const onPlayLocal = jest.fn();
  const onPlayOnline = jest.fn();
  const utils = render(<TitleScreen onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />);
  return { ...utils, onPlayLocal, onPlayOnline };
}

/** menu モード → local モードへ遷移するヘルパー */
function goToLocalMode(getByTestId: ReturnType<typeof render>['getByTestId']) {
  fireEvent.press(getByTestId('play-local-btn'));
}

describe('TitleScreen — menu モード', () => {
  it('title-screen が表示される', () => {
    const { getByTestId } = renderTitle();
    expect(getByTestId('title-screen')).toBeTruthy();
  });

  it('"CircleTactics" の title-text が表示される', () => {
    const { getByTestId } = renderTitle();
    const titleEl = getByTestId('title-text');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.children).toBe('CircleTactics');
  });

  it('play-local-btn が存在する', () => {
    const { getByTestId } = renderTitle();
    expect(getByTestId('play-local-btn')).toBeTruthy();
  });

  it('play-online-btn が存在する', () => {
    const { getByTestId } = renderTitle();
    expect(getByTestId('play-online-btn')).toBeTruthy();
  });

  it('play-online-btn タップで onPlayOnline が呼ばれる', () => {
    const { getByTestId, onPlayOnline } = renderTitle();
    fireEvent.press(getByTestId('play-online-btn'));
    expect(onPlayOnline).toHaveBeenCalledTimes(1);
  });

  it('menu モードでは seat-toggle が表示されない', () => {
    const { queryByTestId } = renderTitle();
    expect(queryByTestId('seat-toggle-RED')).toBeNull();
  });

  it('play-local-btn タップで local モードへ遷移する（onPlayLocal は呼ばれない）', () => {
    const { getByTestId, queryByTestId, onPlayLocal } = renderTitle();
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).not.toHaveBeenCalled();
    // local モードへ遷移して seat-toggle が現れる
    expect(queryByTestId('seat-toggle-RED')).toBeTruthy();
  });
});

describe('TitleScreen — local モード（座席設定）', () => {
  it('全4席のシートトグルが表示される', () => {
    const { getByTestId } = renderTitle();
    goToLocalMode(getByTestId);
    ['RED', 'BLUE', 'YELLOW', 'GREEN'].forEach((p) => {
      expect(getByTestId(`seat-toggle-${p}`)).toBeTruthy();
    });
  });

  it('Start ボタンタップで onPlayLocal がデフォルト人間配列を渡して呼ばれる', () => {
    const { getByTestId, onPlayLocal } = renderTitle();
    goToLocalMode(getByTestId);
    fireEvent.press(getByTestId('play-local-btn')); // local モードの Start ボタン
    expect(onPlayLocal).toHaveBeenCalledWith(['RED']);
  });

  it('シートをトグルして複数の人間プレイヤーでプレイできる', () => {
    const { getByTestId, onPlayLocal } = renderTitle();
    goToLocalMode(getByTestId);
    fireEvent.press(getByTestId('seat-toggle-BLUE'));
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['RED', 'BLUE']);
  });

  it('最後の人間席（RED）はロックされてタップしても切り替わらない', () => {
    const { getByTestId, onPlayLocal } = renderTitle();
    goToLocalMode(getByTestId);
    // RED が唯一の人間 → disabled なのでタップしても切り替わらない
    fireEvent.press(getByTestId('seat-toggle-RED'));
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['RED']); // 変化なし
  });

  it('BLUEをhumanにしてからREDをAIに戻せる', () => {
    const { getByTestId, onPlayLocal } = renderTitle();
    goToLocalMode(getByTestId);
    fireEvent.press(getByTestId('seat-toggle-BLUE')); // BLUE → human
    fireEvent.press(getByTestId('seat-toggle-RED'));   // RED → ai（BLUEが残るのでOK）
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['BLUE']);
  });

  it('humanをAIに戻せる（double-toggle）', () => {
    const { getByTestId, onPlayLocal } = renderTitle();
    goToLocalMode(getByTestId);
    fireEvent.press(getByTestId('seat-toggle-BLUE')); // ai→human
    fireEvent.press(getByTestId('seat-toggle-BLUE')); // human→ai
    fireEvent.press(getByTestId('play-local-btn'));
    expect(onPlayLocal).toHaveBeenCalledWith(['RED']); // BLUEは外れる
  });

  it('Back ボタンで menu モードに戻る', () => {
    const { getByTestId, queryByTestId } = renderTitle();
    goToLocalMode(getByTestId);
    expect(queryByTestId('seat-toggle-RED')).toBeTruthy();
    fireEvent.press(getByTestId('back-btn'));
    expect(queryByTestId('seat-toggle-RED')).toBeNull();
    expect(queryByTestId('play-online-btn')).toBeTruthy();
  });
});
