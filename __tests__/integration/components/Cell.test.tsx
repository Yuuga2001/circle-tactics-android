import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Cell from '../../../src/components/Cell';
import { CellState } from '../../../src/types';

const emptyCell: CellState = [null, null, null];

describe('Cell', () => {
  it('空のセルが表示される', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={emptyCell} onPress={onPress} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('testIDがcell-{row}-{col}形式である', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Cell row={2} col={3} cell={emptyCell} onPress={onPress} />
    );
    expect(getByTestId('cell-2-3')).toBeTruthy();
  });

  it('押すとonPressが呼び出される', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Cell row={1} col={1} cell={emptyCell} onPress={onPress} />
    );
    fireEvent.press(getByTestId('cell-1-1'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ピースが含まれるセルを表示できる', () => {
    const onPress = jest.fn();
    const cellWithPiece: CellState = [{ player: 'RED', size: 'SMALL' }, null, null];
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={cellWithPiece} onPress={onPress} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('isWinning=trueのときセルが表示される', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={emptyCell} onPress={onPress} isWinning={true} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('isValid=trueのときセルが表示される', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={emptyCell} onPress={onPress} isValid={true} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('cellSizeを指定できる', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Cell row={0} col={0} cell={emptyCell} onPress={onPress} cellSize={80} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('複数のピース（SMALL,MEDIUM,LARGE）がすべて含まれるセルを表示できる', () => {
    const onPress = jest.fn();
    const cellFull: CellState = [
      { player: 'RED', size: 'SMALL' },
      { player: 'BLUE', size: 'MEDIUM' },
      { player: 'GREEN', size: 'LARGE' },
    ];
    const { getByTestId } = render(
      <Cell row={3} col={3} cell={cellFull} onPress={onPress} />
    );
    expect(getByTestId('cell-3-3')).toBeTruthy();
  });
});
