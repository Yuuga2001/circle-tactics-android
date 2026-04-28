import React, { useEffect, useReducer, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { gameReducer, createInitialGameState } from '../logic/gameReducer';
import { findBestMove } from '../logic/ai';
import { hasAnyValidMove } from '../logic/winConditions';
import BoardComponent from './Board';

const MOVE_DELAY = 850;
const RESET_DELAY = 2200;

const DemoBoard: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    dispatch({ type: 'START_GAME', payload: { humanPlayers: [] } });
  }, []);

  useEffect(() => {
    if (state.gameMode !== 'PLAYING') return;
    if (state.winner) {
      const t = setTimeout(() => dispatch({ type: 'RESTART_GAME' }), RESET_DELAY);
      return () => clearTimeout(t);
    }
    if (!hasAnyValidMove(state.board, state.hands[state.currentPlayer])) {
      const t = setTimeout(() => dispatch({ type: 'SKIP_TURN' }), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const move = findBestMove(state);
      if (!move) return;
      dispatch({ type: 'SELECT_SIZE', payload: move.size });
      setTimeout(() => dispatch({ type: 'PLACE_PIECE', payload: { row: move.row, col: move.col } }), 180);
    }, MOVE_DELAY);
    return () => clearTimeout(t);
  }, [state.currentPlayer, state.winner, state.gameMode, state.board, state.hands]);

  if (state.gameMode !== 'PLAYING') return null;

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View style={styles.boardWrap}>
        <BoardComponent
          board={state.board}
          onCellClick={() => {}}
          winningCells={state.winInfo?.cells}
          winningPlayer={state.winInfo?.player ?? null}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  boardWrap: {
    width: '100%',
    opacity: 0.72,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default DemoBoard;
