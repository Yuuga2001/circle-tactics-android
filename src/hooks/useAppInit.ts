import { useState, useEffect } from 'react';
import { getClientId } from '../online/clientId';
import { audioManager } from '../audio/audioManager';

interface AppInitResult {
  ready: boolean;
  clientId: string | null;
}

export function useAppInit(): AppInitResult {
  const [ready, setReady] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [id] = await Promise.all([
        getClientId(),
        audioManager.initialize().catch(() => undefined),
      ]);

      if (!cancelled) {
        setClientId(id);
        setReady(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return { ready, clientId };
}
