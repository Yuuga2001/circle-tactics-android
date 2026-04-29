import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BoardState, Player } from '../types';
import { COLORS, RADIUS, SHADOWS, BOARD_GAP, BOARD_PADDING } from '../styles/theme';
import Cell from './Cell';

interface BoardLayoutInfo {
  pageX: number;
  pageY: number;
  cellSize: number;
}

interface BoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  winningCells?: { row: number; col: number }[];
  winningPlayer?: Player | null;
  validCells?: Set<string> | { row: number; col: number }[] | null;
  dragOverCell?: { row: number; col: number } | null;
  onCellLayout?: (row: number, col: number, x: number, y: number, w: number, h: number) => void;
  onBoardLayout?: (layout: BoardLayoutInfo) => void;
  // 外部からリクエストされたら再計測する ref
  remeasureRef?: React.MutableRefObject<(() => void) | null>;
}

const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  winningCells,
  winningPlayer,
  validCells,
  dragOverCell,
  onCellLayout,
  onBoardLayout,
  remeasureRef,
}) => {
  const [boardW, setBoardW] = useState(0);
  const gridRef = useRef<View>(null);

  // measureInWindow はタッチイベントと同じウィンドウ座標系を返す（measure() はステータスバー分ずれる場合あり）
  const doMeasure = useCallback(() => {
    if (!onBoardLayout || !gridRef.current) return;
    gridRef.current.measureInWindow((x, y, width) => {
      if (width > 0) {
        const cs = Math.floor((width - BOARD_GAP * 3) / 4);
        onBoardLayout({ pageX: x, pageY: y, cellSize: cs });
      }
    });
  }, [onBoardLayout]);

  // 外部から再計測を呼び出せるよう ref に登録
  useEffect(() => {
    if (remeasureRef) remeasureRef.current = doMeasure;
  }, [remeasureRef, doMeasure]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setBoardW(w);
    setTimeout(doMeasure, 0);
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
      <View ref={gridRef} style={styles.grid} onLayout={handleLayout}>
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
