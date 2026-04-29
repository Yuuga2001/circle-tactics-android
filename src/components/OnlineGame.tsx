import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieceSize, Player, SIZES } from '../types';
import { api, friendlyError } from '../online/api';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { useHeartbeat } from '../online/useHeartbeat';
import { clearActiveGame, saveActiveGame } from '../online/activeGame';
import { useLang } from '../i18n';
import { useGameSounds } from '../hooks/useGameSounds';
import BoardComponent from './Board';
import PlayerHand from './PlayerHand';
import HandsSummary from './HandsSummary';
import Toast from './Toast';
import AnnounceOverlay from './AnnounceOverlay';
import Confetti from './Confetti';
import ConfirmDialog from './ConfirmDialog';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import { useBoardDrag } from './useBoardDrag';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  PLAYER_BORDER_COLORS,
  PlayerKey,
} from '../styles/theme';

export interface OnlineGameProps {
  gameId: string;
  clientId: string;
  initialSession: GameSession;
  onLeave: () => void;
  onDemoted: (session: GameSession) => void;
}

const AI_TAKEOVER_MS = 30_000;
const AI_INITIAL_DELAY_MS = 4500;

type Phase = 'rouletting' | 'announcing' | 'playing';

function shouldSkipRoulette(s: GameSession): boolean {
  if (s.winner) return true;
  for (const row of s.board) for (const cell of row) for (const slot of cell) if (slot !== null) return true;
  if (s.startedAt) {
    const elapsed = Date.now() - new Date(s.startedAt).getTime();
    if (elapsed > AI_INITIAL_DELAY_MS) return true;
  }
  return false;
}

const OnlineGame: React.FC<OnlineGameProps> = ({ gameId, clientId, initialSession, onLeave, onDemoted }) => {
  const { t } = useLang();
  const { play } = useGameSounds();
  const { session, setSession } = usePolling(gameId);
  const current = session ?? initialSession;
  useHeartbeat(gameId, clientId, current.status !== 'FINISHED');

  // Demotion detection
  const demotedRef = useRef(false);
  useEffect(() => {
    if (!session || demotedRef.current) return;
    if (session.status !== 'PLAYING') return;
    const inPlayers = session.players.some((p) => p.clientId === clientId);
    if (inPlayers) return;
    demotedRef.current = true;
    onDemoted(session);
  }, [session, clientId, onDemoted]);

  const me = current.players.find((p) => p.clientId === clientId);
  const myColor = me?.color ?? null;
  const isMyTurn = !!myColor && current.currentPlayer === myColor && !current.winner;

  // Roulette
  const [phase, setPhase] = useState<Phase>(() =>
    shouldSkipRoulette(initialSession) ? 'playing' : 'rouletting',
  );
  const [rouletteHighlight, setRouletteHighlight] = useState<Player>(current.turnOrder[0]);
  const turnOrderRef = useRef<Player[]>(current.turnOrder);

  useEffect(() => {
    if (phase !== 'rouletting') return;
    turnOrderRef.current = current.turnOrder;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'announcing') return;
    const timer = setTimeout(() => setPhase('playing'), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  // Optimistic UI for select-size
  const [optimisticSelectedSize, setOptimisticSelectedSize] = useState<PieceSize | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const confirm = (message: string, onConfirm: () => void) => {
    if (current.status === 'FINISHED') {
      onConfirm();
      return;
    }
    setConfirmDialog({ message, onConfirm });
  };

  useEffect(() => {
    if (current.selectedSize === optimisticSelectedSize) setOptimisticSelectedSize(null);
  }, [current.selectedSize, optimisticSelectedSize]);

  const handleSelectSize = async (size: PieceSize) => {
    if (!isMyTurn || phase !== 'playing') return;
    play('select');
    setOptimisticSelectedSize(size);
    setErrorMsg(null);
    try {
      const updated = await api.selectSize(gameId, clientId, size);
      setSession(updated);
    } catch (e) {
      setOptimisticSelectedSize(null);
      setErrorMsg(friendlyError(e));
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!isMyTurn || phase !== 'playing') return;
    const size = (optimisticSelectedSize ?? current.selectedSize) || undefined;
    if (!size) return;
    setErrorMsg(null);
    try {
      const updated = await api.placePiece(gameId, clientId, row, col, size);
      setSession(updated);
      setOptimisticSelectedSize(null);
    } catch (e) {
      setErrorMsg(friendlyError(e));
    }
  };

  const drag = useBoardDrag({
    player: current.currentPlayer,
    hand: current.hands[current.currentPlayer],
    enabled: isMyTurn && phase === 'playing',
    onSelectSize: handleSelectSize,
    onPlace: handleCellClick,
    boardLayout: null,
  });

  const handleRestart = async () => {
    try {
      const updated = await api.restart(gameId, clientId);
      setSession(updated);
      setRouletteHighlight(updated.turnOrder[0]);
      setPhase('rouletting');
    } catch (e) {
      setErrorMsg(friendlyError(e));
    }
  };

  const handleLeave = () => {
    confirm(t.confirmLeaveOnline, () => {
      api.leave(gameId, clientId).catch(() => {});
      clearActiveGame();
      onLeave();
    });
  };

  useEffect(() => {
    saveActiveGame({ gameId, roomCode: current.roomCode, color: myColor ?? undefined });
  }, [gameId, current.roomCode, myColor]);

  useEffect(() => {
    if (current.status === 'FINISHED') clearActiveGame();
  }, [current.status]);

  const selectedSize = optimisticSelectedSize ?? current.selectedSize;
  const summaryHighlight = phase === 'playing' ? current.currentPlayer : rouletteHighlight;
  const humanPlayers = useMemo(
    () => current.players.filter((p) => p.isHuman).map((p) => p.color),
    [current.players],
  );

  const validCells = useMemo((): { row: number; col: number }[] | undefined => {
    if (!isMyTurn || phase !== 'playing' || current.winner) return undefined;
    const cells: { row: number; col: number }[] = [];
    current.board.forEach((row, r) =>
      row.forEach((cell, c) => {
        const fits = selectedSize
          ? cell[SIZES.indexOf(selectedSize)] === null && current.hands[current.currentPlayer][selectedSize] > 0
          : SIZES.some((s) => current.hands[current.currentPlayer][s] > 0 && cell[SIZES.indexOf(s)] === null);
        if (fits) cells.push({ row: r, col: c });
      }),
    );
    return cells;
  }, [isMyTurn, phase, current.winner, current.board, current.hands, current.currentPlayer, selectedSize]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (current.status !== 'PLAYING' || current.winner) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [current.status, current.winner]);

  const currentPlayerEntry = current.players.find((p) => p.color === current.currentPlayer);
  const elapsedSinceActivity = currentPlayerEntry?.isHuman
    ? now - new Date(currentPlayerEntry.lastActiveAt).getTime()
    : 0;
  const takeoverSecondsLeft =
    currentPlayerEntry?.isHuman && elapsedSinceActivity > AI_TAKEOVER_MS / 2
      ? Math.max(0, Math.ceil((AI_TAKEOVER_MS - elapsedSinceActivity) / 1000))
      : null;

  // Sounds
  const prevRouletteRef = useRef(rouletteHighlight);
  useEffect(() => {
    if (phase === 'rouletting' && rouletteHighlight !== prevRouletteRef.current) play('roulette');
    prevRouletteRef.current = rouletteHighlight;
  }, [rouletteHighlight, phase, play]);
  useEffect(() => {
    if (phase === 'announcing') play('first');
  }, [phase, play]);
  const prevWinnerRef = useRef<typeof current.winner>(null);
  useEffect(() => {
    if (current.winner && current.winner !== prevWinnerRef.current) {
      play((current.winner as string) === 'DRAW' ? 'draw' : 'win');
    }
    prevWinnerRef.current = current.winner;
  }, [current.winner, play]);
  const pieceCount = useMemo(
    () => current.board.flat().flat().filter((p) => p !== null).length,
    [current.board],
  );
  const prevPieceCountRef = useRef(pieceCount);
  useEffect(() => {
    if (phase === 'playing' && pieceCount > prevPieceCountRef.current) play('place');
    prevPieceCountRef.current = pieceCount;
  }, [pieceCount, phase, play]);

  const playerLabel = (p: Player) =>
    humanPlayers.includes(p) ? `${t.playerLabel} ${p}` : `${p} (${t.aiLabel})`;

  const turnText = current.winner
    ? (current.winner as string) === 'DRAW'
      ? t.draw
      : t.playerWins(playerLabel(current.winner))
    : phase === 'rouletting'
      ? t.pickingFirst
      : phase === 'announcing'
        ? t.goesFirst(playerLabel(current.currentPlayer))
        : !humanPlayers.includes(current.currentPlayer)
          ? t.aiThinking(current.currentPlayer)
          : isMyTurn
            ? t.turnYou
            : t.turnPlayer(current.currentPlayer);

  const victoryOverlay: PlayerKey | null =
    current.winner && (current.winner as string) !== 'DRAW' ? (current.winner as PlayerKey) : null;

  return (
    <ScreenContainer victoryOverlay={victoryOverlay}>
      {current.winner && (current.winner as string) !== 'DRAW' && <Confetti />}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>CircleTactics</Text>
          {!!current.roomCode && <Text style={styles.roomCode}>#{current.roomCode}</Text>}
        </View>

        <HandsSummary
          hands={current.hands}
          players={current.turnOrder}
          humanPlayers={humanPlayers}
          currentPlayer={summaryHighlight}
          myColor={myColor}
        />

        <View testID="online-game-board" style={styles.boardArea}>
          <BoardComponent
            board={current.board}
            onCellClick={handleCellClick}
            winningCells={current.winInfo?.cells}
            winningPlayer={current.winInfo?.player ?? null}
            validCells={validCells}
            dragOverCell={drag.hoverCell}
          />
          {phase === 'announcing' && (
            <AnnounceOverlay
              player={current.currentPlayer}
              label={t.firstLabel}
              role={humanPlayers.includes(current.currentPlayer) ? t.playerLabel : t.aiLabel}
            />
          )}
        </View>

        <View style={styles.statusBar}>
          {current.winner ? (
            <View style={styles.victoryBlock}>
              <Text testID="online-victory-text" style={styles.victoryText}>
                {(current.winner as string) === 'DRAW'
                  ? t.draw
                  : t.playerWins(playerLabel(current.winner))}
              </Text>
              {(current.winner as string) !== 'DRAW' && current.winInfo && (
                <Text style={styles.victoryReason}>
                  {current.winInfo.kind === 'CELL' ? t.winCell : t.winRow}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.statusLine}>
              <Text style={styles.turnText}>{turnText}</Text>
              {phase === 'playing' && takeoverSecondsLeft !== null && (
                <Text style={styles.takeoverWarning}>
                  {t.disconnected(current.currentPlayer, takeoverSecondsLeft)}
                </Text>
              )}
            </View>
          )}
        </View>

        {!current.winner && myColor && (
          <View style={styles.activeHandWrapper}>
            <PlayerHand
              player={phase === 'playing' ? current.currentPlayer : rouletteHighlight}
              hand={current.hands[phase === 'playing' ? current.currentPlayer : rouletteHighlight]}
              selectedSize={phase === 'playing' ? selectedSize : null}
              onSelectSize={handleSelectSize}
              isCurrentPlayer={phase === 'playing'}
              variant="full"
              interactive={isMyTurn && phase === 'playing'}
              draggingSize={drag.draggingSize}
              label={
                phase !== 'playing'
                  ? ' '
                  : isMyTurn
                    ? t.yourHand
                    : `${current.currentPlayer} (${humanPlayers.includes(current.currentPlayer) ? t.playerLabel : t.aiLabel})`
              }
            />
          </View>
        )}

        {current.winner ? (
          <View style={styles.victoryActions}>
            <Button title={t.playAgain} variant="header" onPress={handleRestart} testID="online-play-again-btn" />
            <Button title={t.leave} variant="header" onPress={handleLeave} testID="online-leave-btn" />
          </View>
        ) : (
          <View style={styles.leaveOnlineWrap}>
            <Button title={t.leaveOnline} variant="ghost" onPress={handleLeave} testID="online-leave-btn" />
          </View>
        )}
      </ScrollView>

      {!!errorMsg && <Toast message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

      <ConfirmDialog
        visible={!!confirmDialog}
        message={confirmDialog?.message ?? ''}
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 8,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.titleSm,
    color: COLORS.boardFrame,
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  roomCode: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    color: COLORS.boardFrame,
    backgroundColor: 'rgba(255,255,255,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
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
  statusLine: {
    alignItems: 'center',
    gap: 4,
  },
  turnText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.status,
    color: COLORS.boardFrame,
    textAlign: 'center',
  },
  takeoverWarning: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: PLAYER_BORDER_COLORS.RED,
    backgroundColor: 'rgba(255,235,130,0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
  activeHandWrapper: { alignItems: 'center' },
  victoryActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  leaveOnlineWrap: { alignItems: 'center', marginTop: 4 },
});

export default OnlineGame;
