import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Section from '../../../../src/components/ui/Section';

describe('Section', () => {
  it('子要素を表示する', () => {
    const { getByText } = render(<Section><Text>content</Text></Section>);
    expect(getByText('content')).toBeTruthy();
  });

  it('title が指定されたとき表示される', () => {
    const { getByText } = render(<Section title="MY SECTION"><Text>body</Text></Section>);
    expect(getByText('MY SECTION')).toBeTruthy();
  });

  it('title が未指定のときタイトルなしでレンダーされる', () => {
    const { queryByText } = render(<Section><Text>only body</Text></Section>);
    expect(queryByText('only body')).toBeTruthy();
  });

  it('style prop が適用される', () => {
    const { getByText } = render(
      <Section style={{ margin: 0 }}><Text>styled</Text></Section>
    );
    expect(getByText('styled')).toBeTruthy();
  });
});
