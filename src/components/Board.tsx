import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BoardState } from '../types';
import { COLORS, BOARD_PADDING } from '../styles/theme';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  winningCells?: { row: number; col: number }[];
  validCells?: { row: number; col: number }[];
}

const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  winningCells = [],
  validCells = [],
}) => {
  const isWinning = (row: number, col: number): boolean =>
    winningCells.some((c) => c.row === row && c.col === col);

  const isValid = (row: number, col: number): boolean =>
    validCells.some((c) => c.row === row && c.col === col);

  return (
    <View style={styles.container}>
      {board.map((rowCells, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {rowCells.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              cell={cell}
              onPress={() => onCellClick(rowIndex, colIndex)}
              isWinning={isWinning(rowIndex, colIndex)}
              isValid={isValid(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceAlt,
    padding: BOARD_PADDING,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
});

export default Board;
