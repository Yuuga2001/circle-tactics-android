import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'circletactics.activeGame';
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export interface ActiveGameInfo {
  gameId: string;
  roomCode: string;
  color?: string;
  savedAt: number;
}

export async function saveActiveGame(info: { gameId: string; roomCode: string; color?: string }): Promise<void> {
  try {
    const payload: ActiveGameInfo = { ...info, savedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // noop
  }
}

export async function loadActiveGame(): Promise<ActiveGameInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveGameInfo;
    if (!parsed.gameId || !parsed.roomCode) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearActiveGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // noop
  }
}

// ── Live room code (in-memory pub/sub for AppChrome) ─────────────────────────

let _liveRoomCode: string | null = null;
const _roomCodeListeners = new Set<(c: string | null) => void>();

export function setLiveRoomCode(code: string | null): void {
  _liveRoomCode = code;
  _roomCodeListeners.forEach((fn) => fn(code));
}

export function useLiveRoomCode(): string | null {
  const [code, setCode] = useState<string | null>(_liveRoomCode);
  useEffect(() => {
    setCode(_liveRoomCode);
    _roomCodeListeners.add(setCode);
    return () => { _roomCodeListeners.delete(setCode); };
  }, []);
  return code;
}
