import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Board from '../../../src/components/Board';
import { BoardState, CellState } from '../../../src/types';

const emptyCell: CellState = [null, null, null];
const emptyBoard: BoardState = [
  [emptyCell, emptyCell, emptyCell, emptyCell],
  [emptyCell, emptyCell, emptyCell, emptyCell],
  [emptyCell, emptyCell, emptyCell, emptyCell],
  [emptyCell, emptyCell, emptyCell, emptyCell],
];

describe('Board', () => {
  it('16個のセルが表示される', () => {
    const onCellClick = jest.fn();
    const { getAllByTestId } = render(
      <Board board={emptyBoard} onCellClick={onCellClick} />
    );
    // cell-{0-3}-{0-3} = 16 cells
    const cells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        cells.push(`cell-${r}-${c}`);
      }
    }
    cells.forEach((testId) => {
      const { getByTestId } = render(
        <Board board={emptyBoard} onCellClick={onCellClick} />
      );
      expect(getByTestId(testId)).toBeTruthy();
    });
  });

  it('getAllByTestId patternで16セルすべて確認できる', () => {
    const onCellClick = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={onCellClick} />
    );
    let count = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        expect(getByTestId(`cell-${r}-${c}`)).toBeTruthy();
        count++;
      }
    }
    expect(count).toBe(16);
  });

  it('セルを押すとonCellClickが正しい座標で呼ばれる', () => {
    const onCellClick = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={onCellClick} />
    );
    fireEvent.press(getByTestId('cell-2-3'));
    expect(onCellClick).toHaveBeenCalledWith(2, 3);
  });

  it('onCellClickが(0,0)で呼ばれる', () => {
    const onCellClick = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={onCellClick} />
    );
    fireEvent.press(getByTestId('cell-0-0'));
    expect(onCellClick).toHaveBeenCalledWith(0, 0);
  });

  it('winningCellsを指定できる', () => {
    const onCellClick = jest.fn();
    const winningCells = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={onCellClick} winningCells={winningCells} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
    expect(getByTestId('cell-0-1')).toBeTruthy();
  });

  it('validCellsを指定できる', () => {
    const onCellClick = jest.fn();
    const validCells = [{ row: 1, col: 1 }, { row: 2, col: 2 }];
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={onCellClick} validCells={validCells} />
    );
    expect(getByTestId('cell-1-1')).toBeTruthy();
    expect(getByTestId('cell-2-2')).toBeTruthy();
  });

  it('ピースが配置されたボードを表示できる', () => {
    const onCellClick = jest.fn();
    const boardWithPiece: BoardState = [
      [[{ player: 'RED', size: 'LARGE' }, null, null], emptyCell, emptyCell, emptyCell],
      [emptyCell, emptyCell, emptyCell, emptyCell],
      [emptyCell, emptyCell, emptyCell, emptyCell],
      [emptyCell, emptyCell, emptyCell, emptyCell],
    ];
    const { getByTestId } = render(
      <Board board={boardWithPiece} onCellClick={onCellClick} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('onCellLayout が指定されたとき onLayout イベントで呼ばれる', () => {
    const onCellLayout = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={jest.fn()} onCellLayout={onCellLayout} />
    );
    fireEvent(getByTestId('cell-0-0'), 'layout', {
      nativeEvent: { layout: { x: 10, y: 20, width: 72, height: 72 } },
    });
    expect(onCellLayout).toHaveBeenCalledWith(0, 0, 10, 20, 72, 72);
  });

  it('onBoardLayout が指定されたとき Board がマウントされる', () => {
    const onBoardLayout = jest.fn();
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={jest.fn()} onBoardLayout={onBoardLayout} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
  });

  it('validCells を Set で渡してもボードが表示される', () => {
    const validCells = new Set(['0-0', '1-1', '2-2']);
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={jest.fn()} validCells={validCells} />
    );
    expect(getByTestId('cell-0-0')).toBeTruthy();
    expect(getByTestId('cell-1-1')).toBeTruthy();
    expect(getByTestId('cell-3-3')).toBeTruthy();
  });

  it('dragOverCell を指定してもボードが表示される', () => {
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={jest.fn()} dragOverCell={{ row: 2, col: 1 }} />
    );
    expect(getByTestId('cell-2-1')).toBeTruthy();
  });

  it('remeasureRef が渡されると ref.current に関数が設定される', () => {
    const ref = { current: null as (() => void) | null };
    render(<Board board={emptyBoard} onCellClick={jest.fn()} remeasureRef={ref} />);
    expect(typeof ref.current).toBe('function');
  });

  it('winningPlayer を指定してもボードが表示される', () => {
    const winningCells = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }];
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={jest.fn()} winningCells={winningCells} winningPlayer="RED" />
    );
    expect(getByTestId('game-board')).toBeTruthy();
  });

  it('onCellLayout が指定されていないとき layout イベントで呼ばれない', () => {
    const { getByTestId } = render(
      <Board board={emptyBoard} onCellClick={jest.fn()} />
    );
    // onCellLayout なしで layout イベントを送っても例外が起きない
    expect(() =>
      fireEvent(getByTestId('cell-1-2'), 'layout', {
        nativeEvent: { layout: { x: 0, y: 0, width: 72, height: 72 } },
      })
    ).not.toThrow();
  });
});
