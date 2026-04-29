import React from 'react';
import { render } from '@testing-library/react-native';
import Tag from '../../../../src/components/ui/Tag';

describe('Tag', () => {
  it('label を表示する', () => {
    const { getByText } = render(<Tag label="AI" />);
    expect(getByText('AI')).toBeTruthy();
  });

  it('variant=you でレンダーされる', () => {
    const { getByText } = render(<Tag label="You" variant="you" />);
    expect(getByText('You')).toBeTruthy();
  });

  it('variant=host でレンダーされる', () => {
    const { getByText } = render(<Tag label="Host" variant="host" />);
    expect(getByText('Host')).toBeTruthy();
  });

  it('variant=ai でレンダーされる', () => {
    const { getByText } = render(<Tag label="AI" variant="ai" />);
    expect(getByText('AI')).toBeTruthy();
  });

  it('variant=neutral (デフォルト) でレンダーされる', () => {
    const { getByText } = render(<Tag label="Neutral" variant="neutral" />);
    expect(getByText('Neutral')).toBeTruthy();
  });

  it('style prop が適用される', () => {
    const { getByText } = render(<Tag label="Styled" style={{ margin: 0 }} />);
    expect(getByText('Styled')).toBeTruthy();
  });
});
