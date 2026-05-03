import React from 'react';
import { render } from '@testing-library/react-native';
import HandsSummary from '../../../src/components/HandsSummary';
import { Player } from '../../../src/types';

const hands: Record<Player, { SMALL: number; MEDIUM: number; LARGE: number }> = {
  RED:    { SMALL: 2, MEDIUM: 2, LARGE: 2 },
  BLUE:   { SMALL: 1, MEDIUM: 0, LARGE: 1 },
  YELLOW: { SMALL: 0, MEDIUM: 0, LARGE: 0 },
  GREEN:  { SMALL: 2, MEDIUM: 1, LARGE: 0 },
};

const players: Player[] = ['RED', 'BLUE', 'YELLOW', 'GREEN'];

describe('HandsSummary', () => {
  it('全プレイヤーの行が表示される', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />
    );
    for (const p of players) {
      expect(getByTestId(`hands-row-${p}`)).toBeTruthy();
    }
  });

  it('players配列に含まれるプレイヤーのみ表示される', () => {
    const { getByTestId, queryByTestId } = render(
      <HandsSummary
        hands={hands}
        players={['RED', 'BLUE']}
        currentPlayer="RED"
      />
    );
    expect(getByTestId('hands-row-RED')).toBeTruthy();
    expect(getByTestId('hands-row-BLUE')).toBeTruthy();
    expect(queryByTestId('hands-row-YELLOW')).toBeNull();
    expect(queryByTestId('hands-row-GREEN')).toBeNull();
  });

  it('currentPlayer の行がハイライトされている', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="BLUE" />
    );
    const highlighted = getByTestId('hands-row-BLUE');
    expect(highlighted.props.accessibilityState?.selected).toBe(true);
  });

  it('currentPlayer 以外の行はハイライトされていない', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />
    );
    const notHighlighted = getByTestId('hands-row-BLUE');
    expect(notHighlighted.props.accessibilityState?.selected).toBeFalsy();
  });

  it('各プレイヤーの手札数（S/M/L）が表示される', () => {
    const { getByTestId } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />
    );
    expect(getByTestId('hands-count-RED-SMALL')).toBeTruthy();
    expect(getByTestId('hands-count-RED-MEDIUM')).toBeTruthy();
    expect(getByTestId('hands-count-RED-LARGE')).toBeTruthy();
  });

  it('myColor が指定されているとき t.youLabel テキスト(英語 "You")が表示される', () => {
    const { getByText } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" myColor="RED" />
    );
    expect(getByText('You')).toBeTruthy();
  });

  it('myColor が未設定のとき "You" ラベルは表示されない', () => {
    const { queryByText } = render(
      <HandsSummary hands={hands} players={players} currentPlayer="RED" />
    );
    expect(queryByText('You')).toBeNull();
  });
});
