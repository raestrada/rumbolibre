import { useSyncExternalStore } from 'react';
import { getVersion, isReady, subscribe } from './db/database';

export function useDB(): { ready: boolean; version: number } {
  const ready = useSyncExternalStore(subscribe, isReady);
  const version = useSyncExternalStore(subscribe, getVersion);
  return { ready, version };
}
