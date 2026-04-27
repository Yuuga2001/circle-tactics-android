import { useState, useCallback, useEffect } from 'react';
import type { PieceSize, Player, HandState } from '../types';

interface CellLayout {
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Options {
  player: Player;
  hand: HandState;
  enabled: boolean;
  onSelectSize: (size: PieceSize) => void;
  onPlace: (row: number, col: number) => void;
  cellLayouts: CellLayout[];
}

export interface BoardDragApi {
  draggingSize: PieceSize | null;
  hoverCell: { row: number; col: number } | null;
  ghost: null; // Ghost is rendered inline in Board component
  bindLongPress: (size: PieceSize) => Record<string, unknown>;
}

function findCellAt(
  x: number,
  y: number,
  layouts: CellLayout[],
): { row: number; col: number } | null {
  for (const layout of layouts) {
    if (
      x >= layout.x &&
      x <= layout.x + layout.width &&
      y >= layout.y &&
      y <= layout.y + layout.height
    ) {
      return { row: layout.row, col: layout.col };
    }
  }
  return null;
}

export function useBoardDrag({
  hand,
  enabled,
  onSelectSize,
  onPlace,
  cellLayouts,
}: Options): BoardDragApi {
  const [draggingSize, setDraggingSize] = useState<PieceSize | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDraggingSize(null);
      setHoverCell(null);
    }
  }, [enabled]);

  const bindLongPress = useCallback(
    (size: PieceSize) => {
      if (!enabled || hand[size] <= 0) return {};

      return {
        onLongPress: () => {
          onSelectSize(size);
          setDraggingSize(size);
        },
        onResponderMove: (e: { nativeEvent: { pageX: number; pageY: number } }) => {
          if (!draggingSize) return;
          const cell = findCellAt(e.nativeEvent.pageX, e.nativeEvent.pageY, cellLayouts);
          setHoverCell(cell);
        },
        onResponderRelease: (e: { nativeEvent: { pageX: number; pageY: number } }) => {
          if (!draggingSize) return;
          const cell = findCellAt(e.nativeEvent.pageX, e.nativeEvent.pageY, cellLayouts);
          if (cell) onPlace(cell.row, cell.col);
          setDraggingSize(null);
          setHoverCell(null);
        },
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
      };
    },
    [enabled, hand, draggingSize, onSelectSize, onPlace, cellLayouts],
  );

  return {
    draggingSize,
    hoverCell,
    ghost: null,
    bindLongPress,
  };
}
