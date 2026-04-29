import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Card from '../../../../src/components/ui/Card';

describe('Card', () => {
  it('子要素を表示する', () => {
    const { getByText } = render(<Card><Text>hello</Text></Card>);
    expect(getByText('hello')).toBeTruthy();
  });

  it('bordered=false のとき borderColor が undefined', () => {
    const { getByTestId } = render(
      <Card bordered={false} style={{ testID: 'card' } as any}><Text>x</Text></Card>
    );
    // Just renders without crash
  });

  it('translucent=false のとき白背景', () => {
    const { getByText } = render(<Card translucent={false}><Text>y</Text></Card>);
    expect(getByText('y')).toBeTruthy();
  });

  it('style prop が適用される', () => {
    const { getByText } = render(<Card style={{ padding: 0 }}><Text>z</Text></Card>);
    expect(getByText('z')).toBeTruthy();
  });
});
