import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MenuButton from '../../../src/components/MenuButton';

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      bgmLabel: 'BGM',
      seLabel: 'SE',
      soundOn: 'ON',
      soundOff: 'OFF',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
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
});
