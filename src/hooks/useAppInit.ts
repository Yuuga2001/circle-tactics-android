import { useState, useEffect } from 'react';
import { getClientId } from '../online/clientId';
import { loadActiveGame, type ActiveGameInfo } from '../online/activeGame';
import { audioManager } from '../audio/audioManager';

interface AppInitResult {
  ready: boolean;
  clientId: string | null;
  activeGame: ActiveGameInfo | null;
}

export function useAppInit(): AppInitResult {
  const [ready, setReady] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGameInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [id, game] = await Promise.all([
        getClientId(),
        loadActiveGame(),
        audioManager.initialize().catch(() => undefined),
      ]);

      if (!cancelled) {
        setClientId(id);
        setActiveGame(game);
        setReady(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return { ready, clientId, activeGame };
}
