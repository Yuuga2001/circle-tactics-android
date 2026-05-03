import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Action, GameState, PieceSize, Player, SIZES } from '../types';
import { findBestMove } from '../logic/ai';
import { hasAnyValidMove } from '../logic/winConditions';
import { useLang } from '../i18n';
import { useGameSounds } from '../hooks/useGameSounds';
import BoardComponent from './Board';
import PlayerHand from './PlayerHand';
import HandsSummary from './HandsSummary';
import Button from './ui/Button';
import ScreenContainer from './ui/ScreenContainer';
import AnnounceOverlay from './AnnounceOverlay';
import Confetti from './Confetti';
import { useBoardDrag, BoardLayout } from './useBoardDrag';
import Toast from './Toast';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  PlayerKey,
} from '../styles/theme';

const AI_THINKING_TIME = 1000;

type Phase = 'rouletting' | 'announcing' | 'playing';

interface GameProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  restartRef?: React.MutableRefObject<(() => void) | null>;
}

const GameComponent: React.FC<GameProps> = ({ state, dispatch, restartRef }) => {
  const { t } = useLang();
  const { play } = useGameSounds();
  const { board, hands, currentPlayer, turnOrder, winner, winInfo, selectedSize, humanPlayers } = state;
  const isCurrentHuman = humanPlayers.includes(currentPlayer);
  const isAITurn = !isCurrentHuman && !winner;

  const [phase, setPhase] = useState<Phase>('rouletting');
  const [rouletteHighlight, setRouletteHighlight] = useState<Player>(turnOrder[0]);
  const turnOrderRef = useRef<Player[]>(turnOrder);
  const [skippingPlayer, setSkippingPlayer] = useState<Player | null>(null);
  const consecutiveSkipsRef = useRef(0);

  // ── Roulette animation ──
  useEffect(() => {
    if (phase !== 'rouletting') return;
    const order = turnOrder;
    turnOrderRef.current = order;
    const firstPlayer = order[0];
    setRouletteHighlight(firstPlayer);
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
    // Defensive: guarantee the final highlight matches the chosen first player.
    timeouts.push(setTimeout(() => setRouletteHighlight(firstPlayer), cumulative + 1));
    timeouts.push(setTimeout(() => setPhase('announcing'), cumulative + 80));
    return () => timeouts.forEach(clearTimeout);
  }, [phase, turnOrder]);

  // Announce → playing
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

  // Auto-skip / declare draw
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

  // Sounds
  const prevRouletteRef = useRef(rouletteHighlight);
  useEffect(() => {
    if (phase === 'rouletting' && rouletteHighlight !== prevRouletteRef.current) play('roulette');
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

  const [isExiting, setIsExiting] = useState(false);
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);
  const [rejectToast, setRejectToast] = useState(false);
  const boardRemeasureRef = useRef<(() => void) | null>(null);
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
    boardLayout,
    remeasureBoard: () => boardRemeasureRef.current?.(),
    validCells,
    onReject: () => { play('reject'); setRejectToast(true); },
  });

  const handleRestart = () => {
    dispatch({ type: 'RESTART_GAME' });
    setPhase('rouletting');
    setSkippingPlayer(null);
    consecutiveSkipsRef.current = 0;
  };

  useEffect(() => {
    if (restartRef) restartRef.current = handleRestart;
    return () => { if (restartRef) restartRef.current = null; };
  });

  const handleReturnToTitle = () => {
    setIsExiting(true);
    setTimeout(() => dispatch({ type: 'RETURN_TO_TITLE' }), 100);
  };


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

  const victoryOverlay: PlayerKey | null =
    winner && winner !== 'DRAW' ? (winner as PlayerKey) : null;

  if (isExiting) {
    return <ScreenContainer victoryOverlay={null}>{null}</ScreenContainer>;
  }

  return (
    <ScreenContainer victoryOverlay={victoryOverlay}>
      {winner && winner !== 'DRAW' && <Confetti />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={() => boardRemeasureRef.current?.()}
        onMomentumScrollEnd={() => boardRemeasureRef.current?.()}
      >
        <HandsSummary
          hands={hands}
          players={turnOrder}
          humanPlayers={humanPlayers}
          currentPlayer={summaryHighlight}
          myColor={humanPlayers.length === 1 ? humanPlayers[0] : null}
        />

        <View style={styles.boardArea}>
          <BoardComponent
            board={board}
            onCellClick={handleCellClick}
            winningCells={winInfo?.cells}
            winningPlayer={winInfo?.player ?? null}
            validCells={validCells}
            dragOverCell={drag.hoverCell}
            onBoardLayout={setBoardLayout}
            remeasureRef={boardRemeasureRef}
          />
          {phase === 'announcing' && (
            <AnnounceOverlay
              player={currentPlayer}
              label={t.firstLabel}
              role={humanPlayers.includes(currentPlayer) ? t.playerLabel : t.aiLabel}
            />
          )}
          {skippingPlayer && (
            <AnnounceOverlay
              player={skippingPlayer}
              label={t.skipLabel}
              role={t.noMoves}
            />
          )}
        </View>

        {/* Status */}
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
          <View style={styles.activeHandWrapper}>
            <PlayerHand
              player={displayedPlayer}
              hand={hands[displayedPlayer]}
              selectedSize={phase === 'playing' ? selectedSize : null}
              onSelectSize={handleSelectSize}
              isCurrentPlayer={phase === 'playing'}
              variant="full"
              interactive={interactionAllowed}
              draggingSize={drag.draggingSize}
              bindPiecePointerDown={drag.bindPiecePointerDown}
              label={
                phase !== 'playing'
                  ? ' '
                  : isCurrentHuman
                    ? humanPlayers.length === 1
                      ? t.yourHand
                      : `${currentPlayer} - ${t.yourHand}`
                    : `${currentPlayer} (${t.aiLabel})`
              }
            />
          </View>
        )}

        {/* Victory actions */}
        {winner && (
          <View style={styles.victoryActions}>
            <Button title={t.playAgain} variant="header" onPress={handleRestart} testID="play-again-btn" />
            <Button title={t.titleBtn} variant="header" onPress={handleReturnToTitle} testID="title-btn" />
          </View>
        )}
      </ScrollView>
      {drag.ghost}
      <Toast message={rejectToast ? t.cannotPlaceHere : null} duration={1500} onDismiss={() => setRejectToast(false)} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 8,
    paddingTop: 56,
    gap: 8,
  },
  boardArea: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    position: 'relative',
  },
  statusBar: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  turnText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.status,
    color: COLORS.boardFrame,
    textAlign: 'center',
  },
  victoryBlock: {
    alignItems: 'center',
    gap: 4,
  },
  victoryText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.victory,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  victoryReason: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.victoryReason,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  activeHandWrapper: {
    alignItems: 'center',
  },
  victoryActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 4,
  },
});

export default GameComponent;
