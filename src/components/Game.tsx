import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Action, GameState, PieceSize, Player, SIZES } from '../types';
import { findBestMove } from '../logic/ai';
import { hasAnyValidMove } from '../logic/winConditions';
import { useLang } from '../i18n';
import { useGameSounds } from '../hooks/useGameSounds';
import BoardComponent from './Board';
import PlayerHand from './PlayerHand';
import HandsSummary from './HandsSummary';
import { useBoardDrag } from './useBoardDrag';
import { COLORS, FONT_SIZE, SPACING, PLAYER_COLORS } from '../styles/theme';

const AI_THINKING_TIME = 1000;

type Phase = 'rouletting' | 'announcing' | 'playing';

interface GameProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameComponent: React.FC<GameProps> = ({ state, dispatch }) => {
  const { t } = useLang();
  const { play } = useGameSounds();
  const { board, hands, currentPlayer, turnOrder, winner, winInfo, selectedSize, humanPlayers } =
    state;
  const isCurrentHuman = humanPlayers.includes(currentPlayer);
  const isAITurn = !isCurrentHuman && !winner;

  const [phase, setPhase] = useState<Phase>('rouletting');
  const [rouletteHighlight, setRouletteHighlight] = useState<Player>(turnOrder[0]);
  const turnOrderRef = useRef<Player[]>(turnOrder);
  const [skippingPlayer, setSkippingPlayer] = useState<Player | null>(null);
  const consecutiveSkipsRef = useRef(0);

  // Roulette animation
  useEffect(() => {
    if (phase !== 'rouletting') return;
    const order = turnOrderRef.current;
    const cycles = 3;
    const total = cycles * order.length + 1;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    for (let step = 0; step < total; step++) {
      const tVal = step / Math.max(1, total - 1);
      const stepDelay = 70 + Math.pow(tVal, 1.8) * 360;
      cumulative += stepDelay;
      const player = order[step % order.length];
      timeouts.push(setTimeout(() => setRouletteHighlight(player), cumulative));
    }
    timeouts.push(setTimeout(() => setPhase('announcing'), cumulative + 80));
    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  // Announce overlay → playing
  useEffect(() => {
    if (phase !== 'announcing') return;
    const timer = setTimeout(() => setPhase('playing'), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  // AI auto-move
  useEffect(() => {
    if (phase !== 'playing') return;
    if (!isAITurn) return;
    if (skippingPlayer !== null) return;
    if (!hasAnyValidMove(board, hands[currentPlayer])) return;
    const timer = setTimeout(() => {
      const bestMove = findBestMove(state);
      if (bestMove) {
        dispatch({ type: 'SELECT_SIZE', payload: bestMove.size });
        setTimeout(() => {
          dispatch({ type: 'PLACE_PIECE', payload: { row: bestMove.row, col: bestMove.col } });
        }, 200);
      }
    }, AI_THINKING_TIME);
    return () => clearTimeout(timer);
  }, [phase, currentPlayer, winner, isAITurn, skippingPlayer, board, hands, state, dispatch]);

  // Auto-skip
  useEffect(() => {
    if (phase !== 'playing' || !!winner || skippingPlayer !== null) return;
    if (hasAnyValidMove(board, hands[currentPlayer])) {
      consecutiveSkipsRef.current = 0;
      return;
    }
    if (consecutiveSkipsRef.current >= turnOrder.length) {
      dispatch({ type: 'DECLARE_DRAW' });
      return;
    }
    consecutiveSkipsRef.current++;
    setSkippingPlayer(currentPlayer);
    const timer = setTimeout(() => {
      dispatch({ type: 'SKIP_TURN' });
      setSkippingPlayer(null);
    }, 1300);
    return () => clearTimeout(timer);
  }, [phase, winner, currentPlayer, board, hands, skippingPlayer, turnOrder, dispatch]);

  // Sound effects
  const prevRouletteRef = useRef(rouletteHighlight);
  useEffect(() => {
    if (phase === 'rouletting' && rouletteHighlight !== prevRouletteRef.current) {
      play('roulette');
    }
    prevRouletteRef.current = rouletteHighlight;
  }, [rouletteHighlight, phase, play]);

  useEffect(() => {
    if (phase === 'announcing') play('first');
  }, [phase, play]);

  useEffect(() => {
    if (skippingPlayer) play('skip');
  }, [skippingPlayer, play]);

  const prevWinnerRef = useRef<typeof winner>(null);
  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      play(winner === 'DRAW' ? 'draw' : 'win');
    }
    prevWinnerRef.current = winner;
  }, [winner, play]);

  const pieceCount = useMemo(
    () => board.flat().flat().filter((p) => p !== null).length,
    [board],
  );
  const prevPieceCountRef = useRef(pieceCount);
  useEffect(() => {
    if (phase === 'playing' && pieceCount > prevPieceCountRef.current) play('place');
    prevPieceCountRef.current = pieceCount;
  }, [pieceCount, phase, play]);

  const interactionAllowed = phase === 'playing' && isCurrentHuman && !winner;

  const validCells = useMemo((): { row: number; col: number }[] | undefined => {
    if (!interactionAllowed) return undefined;
    const cells: { row: number; col: number }[] = [];
    board.forEach((row, r) =>
      row.forEach((cell, c) => {
        const fits = selectedSize
          ? cell[SIZES.indexOf(selectedSize)] === null && hands[currentPlayer][selectedSize] > 0
          : SIZES.some((s) => hands[currentPlayer][s] > 0 && cell[SIZES.indexOf(s)] === null);
        if (fits) cells.push({ row: r, col: c });
      }),
    );
    return cells;
  }, [interactionAllowed, board, hands, currentPlayer, selectedSize]);

  const handleSelectSize = (size: PieceSize) => {
    if (!interactionAllowed) return;
    play('select');
    dispatch({ type: 'SELECT_SIZE', payload: size });
  };

  const handleCellClick = (row: number, col: number) => {
    if (!interactionAllowed) return;
    dispatch({ type: 'PLACE_PIECE', payload: { row, col } });
  };

  const drag = useBoardDrag({
    player: currentPlayer,
    hand: hands[currentPlayer],
    enabled: interactionAllowed,
    onSelectSize: handleSelectSize,
    onPlace: handleCellClick,
    cellLayouts: [],
  });

  const handleRestart = () => {
    dispatch({ type: 'RESTART_GAME' });
    setPhase('rouletting');
    setSkippingPlayer(null);
    consecutiveSkipsRef.current = 0;
  };

  const handleReturnToTitle = () => {
    dispatch({ type: 'RETURN_TO_TITLE' });
  };

  // Re-arm roulette on new game
  useEffect(() => {
    if (phase === 'rouletting') {
      turnOrderRef.current = turnOrder;
      setRouletteHighlight(turnOrder[0]);
    }
  }, [phase, turnOrder]);

  const playerLabel = (player: Player) =>
    humanPlayers.includes(player) ? `${t.playerLabel} ${player}` : `${player} (${t.aiLabel})`;

  const turnText =
    winner === 'DRAW'
      ? t.draw
      : winner
        ? t.playerWins(playerLabel(winner))
        : phase === 'rouletting'
          ? t.pickingFirst
          : phase === 'announcing'
            ? t.goesFirst(playerLabel(currentPlayer))
            : isAITurn
              ? t.aiThinking(currentPlayer)
              : isCurrentHuman && humanPlayers.length === 1
                ? t.turnYou
                : t.turnPlayer(currentPlayer);

  const summaryHighlight = phase === 'playing' ? currentPlayer : rouletteHighlight;
  const displayedPlayer = summaryHighlight;

  return (
    <View style={styles.container}>
      {/* HandsSummary */}
      <HandsSummary
        hands={hands}
        players={turnOrder}
        currentPlayer={summaryHighlight}
      />

      {/* Board area */}
      <View testID="game-board" style={styles.boardArea}>
        <BoardComponent
          board={board}
          onCellClick={handleCellClick}
          winningCells={winInfo?.cells}
          validCells={validCells}
        />

        {/* Announcing overlay */}
        {phase === 'announcing' && (
          <View style={[styles.overlay, { backgroundColor: PLAYER_COLORS[currentPlayer] + 'cc' }]}>
            <View style={styles.overlayCard}>
              <Text style={styles.overlayLabel}>{t.firstLabel}</Text>
              <Text style={styles.overlayColor}>{currentPlayer}</Text>
              <Text style={styles.overlayRole}>
                {humanPlayers.includes(currentPlayer) ? t.playerLabel : t.aiLabel}
              </Text>
            </View>
          </View>
        )}

        {/* Skip overlay */}
        {skippingPlayer && (
          <View
            testID="skip-overlay"
            style={[styles.overlay, { backgroundColor: PLAYER_COLORS[skippingPlayer] + 'cc' }]}
          >
            <View style={styles.overlayCard}>
              <Text style={styles.overlayLabel}>{t.skipLabel}</Text>
              <Text style={styles.overlayColor}>{skippingPlayer}</Text>
              <Text style={styles.overlayRole}>{t.noMoves}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Status bar */}
      <View style={styles.statusBar}>
        {winner ? (
          <View style={styles.victoryBlock}>
            <Text testID="victory-text" style={styles.victoryText}>
              {winner === 'DRAW' ? t.draw : t.playerWins(playerLabel(winner))}
            </Text>
            {winner !== 'DRAW' && winInfo && (
              <Text style={styles.victoryReason}>
                {winInfo.kind === 'CELL' ? t.winCell : t.winRow}
              </Text>
            )}
          </View>
        ) : (
          <Text testID="turn-text" style={styles.turnText}>
            {turnText}
          </Text>
        )}
      </View>

      {/* Active hand */}
      {!winner && (
        <PlayerHand
          player={displayedPlayer}
          hand={hands[displayedPlayer]}
          selectedSize={phase === 'playing' ? selectedSize : null}
          onSelectSize={handleSelectSize}
          interactive={interactionAllowed}
        />
      )}

      {/* Victory actions */}
      {winner && (
        <View style={styles.victoryActions}>
          <TouchableOpacity
            testID="play-again-btn"
            onPress={handleRestart}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t.playAgain}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="title-btn"
            onPress={handleReturnToTitle}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t.titleBtn}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  boardArea: {
    position: 'relative',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  overlayCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  overlayLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  overlayColor: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  overlayRole: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  statusBar: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  turnText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  victoryBlock: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  victoryText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  victoryReason: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  victoryActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});

export default GameComponent;
