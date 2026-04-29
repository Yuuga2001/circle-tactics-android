import React, { useEffect, useRef, useState } from 'react';
import { Modal, PanResponder, StyleSheet, View } from 'react-native';
import type { PieceSize, Player, HandState } from '../types';
import {
  BOARD_GAP,
  PIECE_SIZE_RATIO,
  PLAYER_BORDER_COLORS,
  PLAYER_COLORS,
} from '../styles/theme';

export interface BoardLayout {
  pageX: number;
  pageY: number;
  cellSize: number;
}

interface Options {
  player: Player;
  hand: HandState;
  enabled: boolean;
  onSelectSize: (size: PieceSize) => void;
  onPlace: (row: number, col: number) => void;
  boardLayout?: BoardLayout | null;
  remeasureBoard?: () => void;
}

export interface BoardDragApi {
  draggingSize: PieceSize | null;
  hoverCell: { row: number; col: number } | null;
  bindPiecePointerDown: (size: PieceSize) => Record<string, unknown>;
  bindLongPress: (size: PieceSize) => Record<string, unknown>;
  ghost: React.ReactNode;
}

const DRAG_THRESHOLD_SQ = 8 * 8;
const PIECE_SIZES: PieceSize[] = ['SMALL', 'MEDIUM', 'LARGE'];

function findCellAt(
  px: number,
  py: number,
  layout: BoardLayout,
): { row: number; col: number } | null {
  const rx = px - layout.pageX;
  const ry = py - layout.pageY;
  const boardSize = 4 * layout.cellSize + 3 * BOARD_GAP;
  if (rx < 0 || ry < 0 || rx > boardSize || ry > boardSize) return null;
  const step = layout.cellSize + BOARD_GAP;
  // BOARD_GAP/2 のオフセットでギャップ中央を境界とし、最近傍セルに吸い付かせる
  const col = Math.min(3, Math.floor((rx + BOARD_GAP / 2) / step));
  const row = Math.min(3, Math.floor((ry + BOARD_GAP / 2) / step));
  return { row, col };
}

export function useBoardDrag(options: Options): BoardDragApi {
  // optsRef lets PanResponder callbacks always read fresh options without recreating responders.
  const optsRef = useRef(options);
  optsRef.current = options;

  const [dragState, setDragState] = useState<{
    size: PieceSize;
    x: number;
    y: number;
    hoverCell: { row: number; col: number } | null;
  } | null>(null);

  const draggingRef = useRef(false);

  useEffect(() => {
    if (!options.enabled) {
      draggingRef.current = false;
      setDragState(null);
    }
  }, [options.enabled]);

  const panResponders = useRef(
    PIECE_SIZES.reduce(
      (acc, size) => {
        acc[size] = PanResponder.create({
          onStartShouldSetPanResponder: () =>
            optsRef.current.enabled && optsRef.current.hand[size] > 0,
          onMoveShouldSetPanResponder: () => false,
          onPanResponderGrant: () => {
            draggingRef.current = false;
          },
          onPanResponderMove: (_evt, gs) => {
            if (!draggingRef.current && gs.dx * gs.dx + gs.dy * gs.dy < DRAG_THRESHOLD_SQ) return;
            const px = gs.moveX;
            const py = gs.moveY;
            if (!draggingRef.current) {
              draggingRef.current = true;
              optsRef.current.onSelectSize(size);
              // ドラッグ開始時にボード座標を再計測（スクロール後のズレを補正）
              optsRef.current.remeasureBoard?.();
            }
            const hoverCell = optsRef.current.boardLayout
              ? findCellAt(px, py, optsRef.current.boardLayout)
              : null;
            setDragState({ size, x: px, y: py, hoverCell });
          },
          onPanResponderRelease: (_evt, gs) => {
            if (!draggingRef.current) {
              optsRef.current.onSelectSize(size);
            } else {
              const px = gs.moveX;
              const py = gs.moveY;
              const hoverCell = optsRef.current.boardLayout
                ? findCellAt(px, py, optsRef.current.boardLayout)
                : null;
              if (hoverCell) {
                optsRef.current.onPlace(hoverCell.row, hoverCell.col);
              }
            }
            draggingRef.current = false;
            setDragState(null);
          },
          onPanResponderTerminationRequest: () => false,
          onPanResponderTerminate: () => {
            draggingRef.current = false;
            setDragState(null);
          },
        });
        return acc;
      },
      {} as Record<PieceSize, ReturnType<typeof PanResponder.create>>,
    ),
  );

  const bindPiecePointerDown = (size: PieceSize): Record<string, unknown> => {
    if (!options.enabled || options.hand[size] <= 0) return {};
    return panResponders.current[size].panHandlers as Record<string, unknown>;
  };

  const ghost = dragState ? (
    <Modal transparent animationType="none" visible statusBarTranslucent>
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {(() => {
          const { player } = optsRef.current;
          const cs = optsRef.current.boardLayout?.cellSize ?? 68;
          const dia = cs * PIECE_SIZE_RATIO[dragState.size];
          return (
            <View
              style={{
                position: 'absolute',
                left: dragState.x - dia / 2,
                top: dragState.y - dia / 2,
                width: dia,
                height: dia,
                borderRadius: dia / 2,
                backgroundColor: PLAYER_COLORS[player],
                borderWidth: 3,
                borderColor: PLAYER_BORDER_COLORS[player],
                opacity: 0.85,
              }}
            />
          );
        })()}
      </View>
    </Modal>
  ) : null;

  return {
    draggingSize: dragState?.size ?? null,
    hoverCell: dragState?.hoverCell ?? null,
    bindPiecePointerDown,
    bindLongPress: bindPiecePointerDown,
    ghost,
  };
}
