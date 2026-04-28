import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BoardState, Player } from '../types';
import { COLORS, RADIUS, SHADOWS, BOARD_GAP, BOARD_PADDING } from '../styles/theme';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  winningCells?: { row: number; col: number }[];
  winningPlayer?: Player | null;
  validCells?: Set<string> | { row: number; col: number }[] | null;
  dragOverCell?: { row: number; col: number } | null;
  onCellLayout?: (row: number, col: number, x: number, y: number, w: number, h: number) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  winningCells,
  winningPlayer,
  validCells,
  dragOverCell,
  onCellLayout,
}) => {
  const [boardW, setBoardW] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setBoardW(e.nativeEvent.layout.width);
  };

  // boardW is the grid's own width (already inside border + padding of outer),
  // so no further subtraction needed — just split by 4 cells and 3 gaps.
  // Fall back to a default (72) so cells are always rendered (e.g. in tests).
  const cellSize = boardW > 0 ? Math.floor((boardW - BOARD_GAP * 3) / 4) : 72;

  const isWinning = (r: number, c: number) =>
    !!winningCells?.some((cell) => cell.row === r && cell.col === c);

  const isValid = (r: number, c: number) => {
    if (!validCells) return false;
    if (validCells instanceof Set) return validCells.has(`${r}-${c}`);
    return validCells.some((cell) => cell.row === r && cell.col === c);
  };

  const isDragOver = (r: number, c: number) =>
    dragOverCell?.row === r && dragOverCell?.col === c;

  return (
    <View testID="game-board" style={[styles.outer, SHADOWS.board]}>
      <View style={styles.grid} onLayout={handleLayout}>
        {board.map((rowCells, rowIndex) => (
          <View key={rowIndex} style={[styles.row, rowIndex < 3 ? { marginBottom: BOARD_GAP } : null]}>
            {rowCells.map((cell, colIndex) => (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={colIndex < 3 ? { marginRight: BOARD_GAP } : null}
                onLayout={(e) => {
                  if (!onCellLayout) return;
                  const { x, y, width, height } = e.nativeEvent.layout;
                  onCellLayout(rowIndex, colIndex, x, y, width, height);
                }}
              >
                <Cell
                  row={rowIndex}
                  col={colIndex}
                  cell={cell}
                  cellSize={cellSize}
                  onPress={() => onCellClick(rowIndex, colIndex)}
                  isWinning={isWinning(rowIndex, colIndex)}
                  winningPlayer={winningPlayer ?? null}
                  isValid={isValid(rowIndex, colIndex)}
                  isDragOver={isDragOver(rowIndex, colIndex)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.boardFrame,
    borderRadius: RADIUS.board,
    borderWidth: 4,
    borderColor: COLORS.boardFrame,
    padding: BOARD_PADDING,
    alignSelf: 'center',
  },
  grid: { flex: 1 },
  row: { flexDirection: 'row', flex: 1 },
});

export default Board;
