import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Toast from '../../../src/components/Toast';

describe('Toast', () => {
  it('message が null のとき何も表示されない', () => {
    const { queryByTestId } = render(<Toast message={null} />);
    expect(queryByTestId('toast-container')).toBeNull();
  });

  it('message が文字列のときメッセージが表示される', () => {
    const { getByTestId, getByText } = render(
      <Toast message="テストメッセージ" />
    );
    expect(getByTestId('toast-container')).toBeTruthy();
    expect(getByText('テストメッセージ')).toBeTruthy();
  });

  it('onDismiss が渡されているとき、トーストをタップすると呼ばれる', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <Toast message="dismiss me" onDismiss={onDismiss} />
    );
    fireEvent.press(getByTestId('toast-container'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('onDismiss が未指定でもタップしてもエラーにならない', () => {
    const { getByTestId } = render(<Toast message="no dismiss" />);
    expect(() => fireEvent.press(getByTestId('toast-container'))).not.toThrow();
  });

  it('message が空文字のときコンテナは表示されない', () => {
    const { queryByTestId } = render(<Toast message="" />);
    expect(queryByTestId('toast-container')).toBeNull();
  });
});
