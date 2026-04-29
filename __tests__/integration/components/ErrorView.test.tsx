import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorView from '../../../src/components/ErrorView';

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      errorTitle: 'Something went wrong',
      errorDesc: 'Please try again.',
      retryBtn: 'Retry',
      backToTitle: '← Back to Title',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ErrorView', () => {
  // ── 表示 ────────────────────────────────────────────────────────────────

  it('error-view が表示される', () => {
    const { getByTestId } = render(<ErrorView onBack={jest.fn()} />);
    expect(getByTestId('error-view')).toBeTruthy();
  });

  it('デフォルトのタイトルが表示される', () => {
    const { getByText } = render(<ErrorView onBack={jest.fn()} />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('デフォルトのメッセージが表示される', () => {
    const { getByText } = render(<ErrorView onBack={jest.fn()} />);
    expect(getByText('Please try again.')).toBeTruthy();
  });

  it('title prop を渡すとデフォルトタイトルが上書きされる', () => {
    const { getByText, queryByText } = render(
      <ErrorView title="カスタムエラー" onBack={jest.fn()} />,
    );
    expect(getByText('カスタムエラー')).toBeTruthy();
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('message prop を渡すとデフォルトメッセージが上書きされる', () => {
    const { getByText, queryByText } = render(
      <ErrorView message="カスタムメッセージ" onBack={jest.fn()} />,
    );
    expect(getByText('カスタムメッセージ')).toBeTruthy();
    expect(queryByText('Please try again.')).toBeNull();
  });

  // ── ボタン表示制御 ──────────────────────────────────────────────────────

  it('onRetry が未指定のとき retry ボタンは表示されない', () => {
    const { queryByTestId } = render(<ErrorView onBack={jest.fn()} />);
    expect(queryByTestId('error-view-retry-btn')).toBeNull();
  });

  it('onRetry が指定されているとき retry ボタンが表示される', () => {
    const { getByTestId } = render(
      <ErrorView onBack={jest.fn()} onRetry={jest.fn()} />,
    );
    expect(getByTestId('error-view-retry-btn')).toBeTruthy();
  });

  it('back ボタンは onRetry の有無によらず常に表示される', () => {
    const { getByTestId: get1 } = render(<ErrorView onBack={jest.fn()} />);
    expect(get1('error-view-back-btn')).toBeTruthy();

    const { getByTestId: get2 } = render(
      <ErrorView onBack={jest.fn()} onRetry={jest.fn()} />,
    );
    expect(get2('error-view-back-btn')).toBeTruthy();
  });

  it('retry ボタンに retryBtn ラベルが表示される', () => {
    const { getByText } = render(
      <ErrorView onBack={jest.fn()} onRetry={jest.fn()} />,
    );
    expect(getByText('Retry')).toBeTruthy();
  });

  it('back ボタンに backToTitle ラベルが表示される', () => {
    const { getByText } = render(<ErrorView onBack={jest.fn()} />);
    expect(getByText('← Back to Title')).toBeTruthy();
  });

  // ── インタラクション ────────────────────────────────────────────────────

  it('retry ボタンを押すと onRetry が呼ばれる', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <ErrorView onBack={jest.fn()} onRetry={onRetry} />,
    );
    fireEvent.press(getByTestId('error-view-retry-btn'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('back ボタンを押すと onBack が呼ばれる', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<ErrorView onBack={onBack} />);
    fireEvent.press(getByTestId('error-view-back-btn'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('retry ボタンを押しても onBack は呼ばれない', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <ErrorView onBack={onBack} onRetry={jest.fn()} />,
    );
    fireEvent.press(getByTestId('error-view-retry-btn'));
    expect(onBack).not.toHaveBeenCalled();
  });

  it('back ボタンを押しても onRetry は呼ばれない', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <ErrorView onBack={jest.fn()} onRetry={onRetry} />,
    );
    fireEvent.press(getByTestId('error-view-back-btn'));
    expect(onRetry).not.toHaveBeenCalled();
  });
});
