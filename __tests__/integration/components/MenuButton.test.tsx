import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MenuButton from '../../../src/components/MenuButton';

const mockSetLang = jest.fn();
const mockSetAuto = jest.fn();

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      bgmLabel: 'BGM',
      seLabel: 'SE',
      soundOn: 'ON',
      soundOff: 'OFF',
      menuLabel: 'Menu',
      titleBtn: 'Back to Title',
      leaveOnline: 'Leave',
      newGame: 'New Game',
      confirmLeave: 'Leave and return to title?',
      confirmLeaveOnline: 'Leave the room and return to title?',
      cancel: 'Cancel',
      ok: 'OK',
    },
    lang: 'en',
    isAuto: true,
    setLang: mockSetLang,
    setAuto: mockSetAuto,
  }),
  LANGUAGES: { en: 'English', ja: '日本語' },
  LangProvider: ({ children }: any) => children,
}));

describe('MenuButton', () => {
  const defaultProps = {
    bgmMuted: false,
    seMuted: false,
    onToggleBgm: jest.fn(),
    onToggleSe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態でモーダルは表示されていない', () => {
    const { queryByTestId } = render(<MenuButton {...defaultProps} />);
    expect(queryByTestId('menu-modal')).toBeNull();
  });

  it('FABボタンをタップするとモーダルが開く', () => {
    const { getByTestId } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByTestId('menu-modal')).toBeTruthy();
  });

  it('モーダル内に BGM トグルボタンが表示される', () => {
    const { getByTestId } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByTestId('menu-bgm-btn')).toBeTruthy();
  });

  it('モーダル内に SE トグルボタンが表示される', () => {
    const { getByTestId } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByTestId('menu-se-btn')).toBeTruthy();
  });

  it('BGM ボタンをタップすると onToggleBgm が呼ばれる', () => {
    const onToggleBgm = jest.fn();
    const { getByTestId } = render(
      <MenuButton {...defaultProps} onToggleBgm={onToggleBgm} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByTestId('menu-bgm-btn'));
    expect(onToggleBgm).toHaveBeenCalledTimes(1);
  });

  it('SE ボタンをタップすると onToggleSe が呼ばれる', () => {
    const onToggleSe = jest.fn();
    const { getByTestId } = render(
      <MenuButton {...defaultProps} onToggleSe={onToggleSe} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByTestId('menu-se-btn'));
    expect(onToggleSe).toHaveBeenCalledTimes(1);
  });

  it('bgmMuted=true のとき BGM ボタンに OFF 状態が反映される', () => {
    const { getByTestId } = render(
      <MenuButton {...defaultProps} bgmMuted={true} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    const bgmBtn = getByTestId('menu-bgm-btn');
    expect(bgmBtn.props.accessibilityState?.checked).toBe(false);
  });

  it('bgmMuted=false のとき BGM ボタンに ON 状態が反映される', () => {
    const { getByTestId } = render(
      <MenuButton {...defaultProps} bgmMuted={false} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    const bgmBtn = getByTestId('menu-bgm-btn');
    expect(bgmBtn.props.accessibilityState?.checked).toBe(true);
  });

  it('モーダルを閉じるボタンでモーダルが閉じる', () => {
    const { getByTestId, queryByTestId } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByTestId('menu-modal')).toBeTruthy();
    fireEvent.press(getByTestId('menu-close-btn'));
    expect(queryByTestId('menu-modal')).toBeNull();
  });

  it('メニューに Language ボタンが表示される', () => {
    const { getByTestId, getByText } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByText('🌐 Language')).toBeTruthy();
  });

  it('Language をタップすると言語ピッカーが開く', () => {
    const { getByTestId, getByText } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('🌐 Language'));
    expect(getByText('Follow device settings')).toBeTruthy();
  });

  it('言語ピッカーに LANGUAGES の一覧が表示される', () => {
    const { getByTestId, getByText, getAllByText } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('🌐 Language'));
    expect(getAllByText('English').length).toBeGreaterThanOrEqual(1);
    expect(getByText('日本語')).toBeTruthy();
  });

  it('isAuto=true のとき "Follow device settings" にチェックマークが表示される', () => {
    const { getByTestId, getByText } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('🌐 Language'));
    expect(getByText('✓')).toBeTruthy();
  });

  it('mode=local で onTitle と onNewGame があるとき両方表示される', () => {
    const onTitle = jest.fn();
    const onNewGame = jest.fn();
    const { getByTestId, getByText } = render(
      <MenuButton {...defaultProps} mode="local" onTitle={onTitle} onNewGame={onNewGame} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByText('Back to Title')).toBeTruthy();
    expect(getByText('New Game')).toBeTruthy();
  });

  it('mode=online のとき Leave ボタンが表示される', () => {
    const onTitle = jest.fn();
    const { getByTestId, getByText } = render(
      <MenuButton {...defaultProps} mode="online" onTitle={onTitle} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    expect(getByText('Leave')).toBeTruthy();
  });

  it('Back to Title ボタンを押すと確認ダイアログが表示される', () => {
    const onTitle = jest.fn();
    const { getByTestId, getByText } = render(
      <MenuButton {...defaultProps} mode="local" onTitle={onTitle} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('Back to Title'));
    expect(getByText('Leave and return to title?')).toBeTruthy();
  });

  it('確認ダイアログで OK を押すと onTitle が呼ばれる', () => {
    const onTitle = jest.fn();
    const { getByTestId, getByText } = render(
      <MenuButton {...defaultProps} mode="local" onTitle={onTitle} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('Back to Title'));
    fireEvent.press(getByText('OK'));
    expect(onTitle).toHaveBeenCalledTimes(1);
  });

  it('確認ダイアログで Cancel を押すとダイアログが閉じる', () => {
    const onTitle = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <MenuButton {...defaultProps} mode="local" onTitle={onTitle} />
    );
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('Back to Title'));
    fireEvent.press(getByText('Cancel'));
    expect(onTitle).not.toHaveBeenCalled();
    expect(queryByText('Leave and return to title?')).toBeNull();
  });

  it('言語ピッカーで言語を選択すると setLang が呼ばれる', () => {
    const { getByTestId, getByText } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('🌐 Language'));
    fireEvent.press(getByText('日本語'));
    expect(mockSetLang).toHaveBeenCalledWith('ja');
  });

  it('言語ピッカーで "Follow device settings" を選択すると setAuto が呼ばれる', () => {
    const { getByTestId, getByText } = render(<MenuButton {...defaultProps} />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('🌐 Language'));
    fireEvent.press(getByText('Follow device settings'));
    expect(mockSetAuto).toHaveBeenCalled();
  });
});
