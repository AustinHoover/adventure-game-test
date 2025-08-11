import { useSyncExternalStore } from 'react';
import { GameState, gameStateStore } from '../game/interface/gamestate';

/**
 * Hook that connects React components to the GameStateStore using useSyncExternalStore.
 * This keeps the state outside React's data flow while making it reactive.
 */
export const useGame = () => {
  // Subscribe to the store and get the current snapshot
  const currentSave = useSyncExternalStore(
    gameStateStore.subscribe.bind(gameStateStore),
    gameStateStore.getSnapshot.bind(gameStateStore)
  );

  return {
    currentSave,
    setCurrentSave: gameStateStore.setCurrentSave.bind(gameStateStore),
    isSaveLoaded: gameStateStore.isSaveLoaded,
    updatePlayerCurrency: gameStateStore.updatePlayerCurrency.bind(gameStateStore),
    advanceGameTime: gameStateStore.advanceGameTime.bind(gameStateStore),
    getCurrentGameTime: gameStateStore.getCurrentGameTime.bind(gameStateStore),
    getCurrentTimeString: gameStateStore.getCurrentTimeString.bind(gameStateStore),
    getMapInfo: gameStateStore.getMapInfo.bind(gameStateStore),
    getMapFromCache: gameStateStore.getMapFromCache.bind(gameStateStore),
    storeMapInCache: gameStateStore.storeMapInCache.bind(gameStateStore),
    clearMapCache: gameStateStore.clearMapCache.bind(gameStateStore),
  };
}; 