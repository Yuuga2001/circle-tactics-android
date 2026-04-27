import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
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
import { useBoardDrag } from './useBoardDrag';
import { COLORS, FONT_SIZE, SPACING, PLAYER_COLORS } from '../styles/theme';

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
  for (const row of s.board) {
    for (const cell of row) {
      for (const slot of cell) {
        if (slot !== null) return true;
      }
    }
  }
  if (s.startedAt) {
    const elapsed = Date.now() - new Date(s.startedAt).getTime();
    if (elapsed > AI_INITIAL_DELAY_MS) return true;
  }
  return false;
}

const OnlineGame: React.FC<OnlineGameProps> = ({
  gameId,
  clientId,
  initialSession,
  onLeave,
  onDemoted,
}) => {
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

  // Identity & turn helpers
  const me = current.players.find((p) => p.clientId === clientId);
  const myColor = me?.color ?? null;
  const isMyTurn = !!myColor && current.currentPlayer === myColor && !current.winner;

  // Opening roulette
  const [phase, setPhase] = useState<Phase>(() =>
    shouldSkipRoulette(initialSession) ? 'playing' : 'rouletting',
  );
  const [rouletteHighlight, setRouletteHighlight] = useState<Player>(
    current.turnOrder[0],
  );
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

  // Actions
  const [optimisticSelectedSize, setOptimisticSelectedSize] = useState<PieceSize | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const confirm = (message: string, onConfirm: () => void) => {
    if (current.status === 'FINISHED') { onConfirm(); return; }
    setConfirmDialog({ message, onConfirm });
  };

  useEffect(() => {
    if (current.selectedSize === optimisticSelectedSize) {
      setOptimisticSelectedSize(null);
    }
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
    cellLayouts: [],
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

  // Keep active game pointer fresh
  useEffect(() => {
    saveActiveGame({ gameId, roomCode: current.roomCode, color: myColor ?? undefined });
  }, [gameId, current.roomCode, myColor]);

  useEffect(() => {
    if (current.status === 'FINISHED') clearActiveGame();
  }, [current.status]);

  // Derived
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

  // Timer for takeover countdown
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (current.status !== 'PLAYING' || current.winner) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [current.status, current.winner]);

  const currentPlayerEntry = current.players.find((p) => p.color === current.currentPlayer);
  const elapsedSinceActivity =
    currentPlayerEntry?.isHuman
      ? now - new Date(currentPlayerEntry.lastActiveAt).getTime()
      : 0;
  const takeoverSecondsLeft =
    currentPlayerEntry?.isHuman && elapsedSinceActivity > AI_TAKEOVER_MS / 2
      ? Math.max(0, Math.ceil((AI_TAKEOVER_MS - elapsedSinceActivity) / 1000))
      : null;

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
    ? t.playerWins(playerLabel(current.winner))
    : phase === 'rouletting'
      ? t.pickingFirst
      : phase === 'announcing'
        ? t.goesFirst(playerLabel(current.currentPlayer))
        : !humanPlayers.includes(current.currentPlayer)
          ? t.aiThinking(current.currentPlayer)
          : isMyTurn
            ? t.turnYou
            : t.turnPlayer(current.currentPlayer);

  return (
    <View testID="online-game-board" style={styles.container}>
      <HandsSummary
        hands={current.hands}
        players={current.turnOrder}
        currentPlayer={summaryHighlight}
      />

      <View style={styles.boardArea}>
        <BoardComponent
          board={current.board}
          onCellClick={handleCellClick}
          winningCells={current.winInfo?.cells}
          validCells={validCells}
        />

        {phase === 'announcing' && (
          <View style={[styles.overlay, { backgroundColor: PLAYER_COLORS[current.currentPlayer] + 'cc' }]}>
            <View style={styles.overlayCard}>
              <Text style={styles.overlayLabel}>{t.firstLabel}</Text>
              <Text style={styles.overlayColor}>{current.currentPlayer}</Text>
              <Text style={styles.overlayRole}>
                {humanPlayers.includes(current.currentPlayer) ? t.playerLabel : t.aiLabel}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.statusBar}>
        {current.winner ? (
          <View style={styles.victoryBlock}>
            <Text testID="online-victory-text" style={styles.victoryText}>
              {t.playerWins(playerLabel(current.winner))}
            </Text>
            {current.winInfo && (
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

      {errorMsg ? (
        <Toast message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      ) : null}

      {!current.winner && myColor ? (
        <View style={styles.activeHandWrapper}>
          <PlayerHand
            player={phase === 'playing' ? current.currentPlayer : rouletteHighlight}
            hand={current.hands[phase === 'playing' ? current.currentPlayer : rouletteHighlight]}
            selectedSize={phase === 'playing' ? selectedSize : null}
            onSelectSize={handleSelectSize}
            interactive={isMyTurn && phase === 'playing'}
          />
        </View>
      ) : null}

      {current.winner ? (
        <View style={styles.victoryActions}>
          <TouchableOpacity
            testID="online-play-again-btn"
            onPress={handleRestart}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t.playAgain}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="online-leave-btn"
            onPress={handleLeave}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t.leave}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          testID="online-leave-btn"
          onPress={handleLeave}
          style={styles.leaveButton}
          activeOpacity={0.8}
        >
          <Text style={styles.leaveButtonText}>{t.leaveOnline}</Text>
        </TouchableOpacity>
      )}

      {drag.ghost}

      <Modal
        visible={!!confirmDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDialog(null)}
      >
        <TouchableOpacity
          style={styles.dialogOverlay}
          activeOpacity={1}
          onPress={() => setConfirmDialog(null)}
        >
          <TouchableOpacity
            style={styles.dialogCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.dialogMessage}>{confirmDialog?.message}</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancel]}
                onPress={() => setConfirmDialog(null)}
              >
                <Text style={styles.dialogButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogConfirm]}
                onPress={() => {
                  confirmDialog?.onConfirm();
                  setConfirmDialog(null);
                }}
              >
                <Text style={styles.dialogButtonText}>{t.ok}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  statusLine: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  turnText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  takeoverWarning: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.sm,
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
  activeHandWrapper: {
    width: '100%',
  },
  victoryActions: {
    flexDirection: 'row',
    gap: SPACING.md,
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
  leaveButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  leaveButtonText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 12,
    width: '80%',
    gap: SPACING.lg,
  },
  dialogMessage: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dialogButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  dialogCancel: {
    backgroundColor: COLORS.surfaceAlt,
  },
  dialogConfirm: {
    backgroundColor: COLORS.accent,
  },
  dialogButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});

export default OnlineGame;
