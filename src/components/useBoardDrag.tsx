import { useCallback, useEffect, useState } from 'react';
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
  cellLayouts?: CellLayout[];
}

export interface BoardDragApi {
  draggingSize: PieceSize | null;
  hoverCell: { row: number; col: number } | null;
  /** Returned to PlayerHand to attach long-press / pointer handlers. */
  bindPiecePointerDown: (size: PieceSize) => Record<string, unknown>;
  /** Legacy alias kept for tests. */
  bindLongPress: (size: PieceSize) => Record<string, unknown>;
  ghost: null;
}

/**
 * Drag-to-place support for the bottom hand.
 *
 * This is a simplified RN port of the Web `useBoardDrag` hook. On Android we
 * primarily rely on tap-to-select + tap-to-place, but we still expose the same
 * interface (`bindPiecePointerDown`, `draggingSize`, `hoverCell`) so call sites
 * stay aligned with the Web app.
 */
export function useBoardDrag({ enabled, hand, onSelectSize }: Options): BoardDragApi {
  const [draggingSize, setDraggingSize] = useState<PieceSize | null>(null);
  const [hoverCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (!enabled) setDraggingSize(null);
  }, [enabled]);

  const bind = useCallback(
    (size: PieceSize) => {
      if (!enabled || hand[size] <= 0) return {};
      return {
        onLongPress: () => {
          onSelectSize(size);
          setDraggingSize(size);
          // Drag is purely visual feedback; tap on cell still places.
          setTimeout(() => setDraggingSize(null), 250);
        },
      } as Record<string, unknown>;
    },
    [enabled, hand, onSelectSize],
  );

  return {
    draggingSize,
    hoverCell,
    bindPiecePointerDown: bind,
    bindLongPress: bind,
    ghost: null,
  };
}
