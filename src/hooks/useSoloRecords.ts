import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'soloRecords';

export interface SoloRecord {
  id: string;
  date: string; // ISO string
  isWin: boolean;
}

export function formatRecordDate(isoString: string): string {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

export async function loadSoloRecords(): Promise<SoloRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SoloRecord[];
  } catch {
    return [];
  }
}

export async function appendSoloRecord(isWin: boolean): Promise<void> {
  try {
    const records = await loadSoloRecords();
    records.push({
      id: `${Date.now()}-${Math.random()}`,
      date: new Date().toISOString(),
      isWin,
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function useSoloRecords() {
  const [records, setRecords] = useState<SoloRecord[]>([]);

  const refresh = useCallback(async () => {
    const loaded = await loadSoloRecords();
    setRecords(loaded);
  }, []);

  return { records, refresh };
}
