import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { api } from './api';
import type { GameSession } from './types';

interface Options {
  intervalMs?: number;
  pause?: boolean;
}

export function usePolling(
  gameId: string | null,
  { intervalMs = 2000, pause = false }: Options = {},
) {
  const [session, setSessionState] = useState<GameSession | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const cancelledRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  // ref で最新の status を追跡（tick クロージャ内での stale closure 防止）
  const sessionStatusRef = useRef<string | null>(null);

  const setSession = (s: GameSession | null) => {
    sessionStatusRef.current = s?.status ?? null;
    setSessionState(s);
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { appStateRef.current = s; });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    if (!gameId) return;

    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (cancelledRef.current) return;
      if (appStateRef.current !== 'active' || pause) {
        timer = setTimeout(tick, intervalMs);
        return;
      }
      try {
        const s = await api.getGame(gameId);
        if (!cancelledRef.current) {
          setSession(s);
          setError(null);
        }
      } catch (e) {
        if (!cancelledRef.current) setError(e as Error);
      } finally {
        if (!cancelledRef.current) {
          const wait = sessionStatusRef.current === 'FINISHED' ? Math.max(intervalMs, 5000) : intervalMs;
          timer = setTimeout(tick, wait);
        }
      }
    };

    tick();
    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, intervalMs, pause]);

  return { session, error, setSession: setSessionState };
}
