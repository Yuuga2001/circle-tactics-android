import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConfirmDialog from '../../../src/components/ConfirmDialog';

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: { ok: 'OK', cancel: 'Cancel' },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ConfirmDialog', () => {
  it('visible=true のときメッセージが表示される', () => {
    const { getByText } = render(
      <ConfirmDialog
        visible
        message="本当に削除しますか？"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('本当に削除しますか？')).toBeTruthy();
  });

  it('visible=false のときメッセージが表示されない', () => {
    const { queryByText } = render(
      <ConfirmDialog
        visible={false}
        message="見えないメッセージ"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(queryByText('見えないメッセージ')).toBeNull();
  });

  it('デフォルトでキャンセルボタンに t.cancel が表示される', () => {
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('デフォルトで確定ボタンに t.ok が表示される', () => {
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(getByText('OK')).toBeTruthy();
  });

  it('cancelLabel を渡すとキャンセルボタンのテキストが上書きされる', () => {
    const { getByText } = render(
      <ConfirmDialog
        visible
        message="msg"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        cancelLabel="閉じる"
      />,
    );
    expect(getByText('閉じる')).toBeTruthy();
  });

  it('confirmLabel を渡すと確定ボタンのテキストが上書きされる', () => {
    const { getByText } = render(
      <ConfirmDialog
        visible
        message="msg"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        confirmLabel="削除する"
      />,
    );
    expect(getByText('削除する')).toBeTruthy();
  });

  it('キャンセルボタンを押すと onCancel が呼ばれる', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('確定ボタンを押すと onConfirm が呼ばれる', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={onConfirm} onCancel={jest.fn()} />,
    );
    fireEvent.press(getByText('OK'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('キャンセルボタンを押しても onConfirm は呼ばれない', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={onConfirm} onCancel={jest.fn()} />,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('確定ボタンを押しても onCancel は呼ばれない', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('OK'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('キャンセルボタンの pressIn / pressOut が例外なく動作する', () => {
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    const cancelBtn = getByText('Cancel');
    expect(() => fireEvent(cancelBtn, 'pressIn')).not.toThrow();
    expect(() => fireEvent(cancelBtn, 'pressOut')).not.toThrow();
  });

  it('確定ボタンの pressIn / pressOut が例外なく動作する', () => {
    const { getByText } = render(
      <ConfirmDialog visible message="msg" onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    const confirmBtn = getByText('OK');
    expect(() => fireEvent(confirmBtn, 'pressIn')).not.toThrow();
    expect(() => fireEvent(confirmBtn, 'pressOut')).not.toThrow();
  });
});
