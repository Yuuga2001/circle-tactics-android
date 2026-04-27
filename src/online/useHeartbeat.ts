import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { api } from './api';

export function useHeartbeat(
  gameId: string | null,
  clientId: string,
  active: boolean,
  intervalMs = 10000,
) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { appStateRef.current = s; });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!gameId || !clientId || !active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (cancelled) return;
      if (appStateRef.current === 'active') {
        try {
          await api.heartbeat(gameId, clientId);
        } catch {
          // retry on next tick
        }
      }
      timer = setTimeout(tick, intervalMs);
    };
    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [gameId, clientId, active, intervalMs]);
}
