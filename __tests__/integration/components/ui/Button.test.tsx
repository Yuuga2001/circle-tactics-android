import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../../src/components/ui/Button';

describe('Button', () => {
  it('primary variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Press" onPress={jest.fn()} />);
    expect(getByText('Press')).toBeTruthy();
  });

  it('secondary variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Secondary" onPress={jest.fn()} variant="secondary" />);
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('ghost variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Ghost" onPress={jest.fn()} variant="ghost" />);
    expect(getByText('Ghost')).toBeTruthy();
  });

  it('header variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Header" onPress={jest.fn()} variant="header" />);
    expect(getByText('Header')).toBeTruthy();
  });

  it('dialogCancel variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Cancel" onPress={jest.fn()} variant="dialogCancel" />);
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('dialogConfirm variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Confirm" onPress={jest.fn()} variant="dialogConfirm" />);
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('play variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Play" onPress={jest.fn()} variant="play" />);
    expect(getByText('Play')).toBeTruthy();
  });

  it('online variant でレンダーされる', () => {
    const { getByText } = render(<Button title="Online" onPress={jest.fn()} variant="online" />);
    expect(getByText('Online')).toBeTruthy();
  });

  it('xl size でレンダーされる', () => {
    const { getByText } = render(<Button title="XL" onPress={jest.fn()} size="xl" />);
    expect(getByText('XL')).toBeTruthy();
  });

  it('lg size でレンダーされる', () => {
    const { getByText } = render(<Button title="LG" onPress={jest.fn()} size="lg" />);
    expect(getByText('LG')).toBeTruthy();
  });

  it('sm size でレンダーされる', () => {
    const { getByText } = render(<Button title="SM" onPress={jest.fn()} size="sm" />);
    expect(getByText('SM')).toBeTruthy();
  });

  it('onPress が呼ばれる', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<Button title="Tap" onPress={onPress} testID="btn" />);
    fireEvent.press(getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled のとき onPress が呼ばれない', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<Button title="Disabled" onPress={onPress} disabled testID="btn" />);
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('fullWidth が適用される', () => {
    const { getByText } = render(<Button title="Full" onPress={jest.fn()} fullWidth />);
    expect(getByText('Full')).toBeTruthy();
  });

  it('testID が設定される', () => {
    const { getByTestId } = render(<Button title="Test" onPress={jest.fn()} testID="my-btn" />);
    expect(getByTestId('my-btn')).toBeTruthy();
  });

  it('pressIn/pressOut イベントがエラーなく実行される', () => {
    const { getByTestId } = render(<Button title="Anim" onPress={jest.fn()} testID="anim-btn" />);
    fireEvent(getByTestId('anim-btn'), 'pressIn');
    fireEvent(getByTestId('anim-btn'), 'pressOut');
  });

  it('disabled=true のとき pressIn がエラーなく実行される', () => {
    const { getByTestId } = render(
      <Button title="Disabled" onPress={jest.fn()} disabled testID="dis-btn" />
    );
    fireEvent(getByTestId('dis-btn'), 'pressIn');
    fireEvent(getByTestId('dis-btn'), 'pressOut');
  });
});
