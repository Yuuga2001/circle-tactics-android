import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import NetworkErrorView from '../../../src/components/NetworkErrorView';

jest.useFakeTimers();

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      networkErrorTitle: 'Connection Error',
      networkErrorDesc: 'Check your connection.\nReconnecting automatically…',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('NetworkErrorView', () => {
  it('visible=false のとき network-error-overlay が存在しない', () => {
    const { queryByTestId } = render(<NetworkErrorView visible={false} />);
    expect(queryByTestId('network-error-overlay')).toBeNull();
  });

  it('visible=true のとき network-error-overlay が表示される', () => {
    const { getByTestId } = render(<NetworkErrorView visible={true} />);
    expect(getByTestId('network-error-overlay')).toBeTruthy();
  });

  it('visible=true のとき networkErrorTitle が表示される', () => {
    const { getByText } = render(<NetworkErrorView visible={true} />);
    expect(getByText('Connection Error')).toBeTruthy();
  });

  it('visible=true のとき networkErrorDesc が表示される', () => {
    const { getByText } = render(<NetworkErrorView visible={true} />);
    expect(getByText(/Check your connection/)).toBeTruthy();
  });

  it('false → true に切り替えると overlay が現れる', () => {
    const { queryByTestId, rerender } = render(<NetworkErrorView visible={false} />);
    expect(queryByTestId('network-error-overlay')).toBeNull();
    rerender(<NetworkErrorView visible={true} />);
    expect(queryByTestId('network-error-overlay')).toBeTruthy();
  });

  it('true → false に切り替えると overlay が消える', () => {
    const { queryByTestId, rerender } = render(<NetworkErrorView visible={true} />);
    expect(queryByTestId('network-error-overlay')).toBeTruthy();
    rerender(<NetworkErrorView visible={false} />);
    expect(queryByTestId('network-error-overlay')).toBeNull();
  });

  it('アニメーションタイマーが例外なく実行される', () => {
    render(<NetworkErrorView visible={true} />);
    expect(() => act(() => { jest.runAllTimers(); })).not.toThrow();
  });

  it('onBack ボタンを押すと onBack コールバックが呼ばれる', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<NetworkErrorView visible={true} onBack={onBack} />);
    fireEvent.press(getByTestId('network-error-back-btn'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
