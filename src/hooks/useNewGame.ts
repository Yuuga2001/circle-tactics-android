import { useState, useEffect, useCallback } from 'react';

let _handler: (() => void) | null = null;
const _listeners = new Set<(h: (() => void) | null) => void>();

export function setNewGameHandler(handler: (() => void) | null): void {
  _handler = handler;
  _listeners.forEach((fn) => fn(handler));
}

export function useNewGameHandler(): (() => void) | null {
  const [wrap, setWrap] = useState<{ fn: (() => void) | null }>({ fn: _handler });
  useEffect(() => {
    const update = (h: (() => void) | null) => setWrap({ fn: h });
    update(_handler);
    _listeners.add(update);
    return () => { _listeners.delete(update); };
  }, []);
  return wrap.fn;
}

export function useRegisterNewGame(handler: () => void): void {
  const stable = useCallback(handler, [handler]);
  useEffect(() => {
    setNewGameHandler(stable);
    return () => setNewGameHandler(null);
  }, [stable]);
}
