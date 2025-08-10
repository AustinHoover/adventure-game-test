import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState } from '../game/interface/save-interfaces';
import { GameMap, Location } from '../game/interface/map-interfaces';
import { incrementGameTime } from '../utils/timeManager';
import { loadMapFile } from '../utils/saveFileOperations';

interface GameContextType {
  currentSave: GameState | null;
  setCurrentSave: (save: GameState | null) => void;
  isSaveLoaded: boolean;
  updatePlayerCurrency: (amount: number) => void;
  advanceGameTime: (minutes: number) => void;
  getCurrentGameTime: () => number;
  getCurrentTimeString: () => string;
  getMapInfo: (mapId: number) => Promise<{ name: string; id: number } | null>;
  getMapFromCache: (mapId: number) => { gameMap: GameMap; locations: Location[] } | null;
  storeMapInCache: (mapId: number, gameMap: GameMap, locations: Location[]) => void;
  clearMapCache: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [mapCache, setMapCache] = useState<Map<number, { gameMap: GameMap; locations: Location[] }>>(new Map());

  const updatePlayerCurrency = (amount: number) => {
    if (currentGame) {
      const playerCharacter = currentGame.characterRegistry.characters.get(currentGame.playerCharacterId);
      if (playerCharacter) {
        const newCurrency = Math.max(0, playerCharacter.inventory.currency + amount);
        playerCharacter.inventory.currency = newCurrency;
        
        // Create a new save object to trigger re-renders
        setCurrentGame({ ...currentGame });
      }
    }
  };

  const advanceGameTime = (minutes: number) => {
    if (currentGame) {
      // Get the player character for simulation effects
      const playerCharacter = currentGame.characterRegistry.characters.get(currentGame.playerCharacterId);
      
      // Use the centralized time management system
      const newTime = incrementGameTime(currentGame.gameTime, minutes, playerCharacter);
      
      const updatedSave = {
        ...currentGame,
        gameTime: newTime
      };
      setCurrentGame(updatedSave);
    }
  };

  const getCurrentGameTime = (): number => {
    return currentGame?.gameTime || 360; // Default to 6:00 AM if no save
  };

  const getCurrentTimeString = (): string => {
    const time = getCurrentGameTime();
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getMapInfo = async (mapId: number): Promise<{ name: string; id: number } | null> => {
    if (!currentGame) return null;
    
    try {
      const mapData = await loadMapFile(currentGame.name, mapId);
      return {
        name: mapData.gameMap.name,
        id: mapData.gameMap.id
      };
    } catch (error) {
      console.error(`Failed to load map info for map ${mapId}:`, error);
      return null;
    }
  };

  const getMapFromCache = (mapId: number): { gameMap: GameMap; locations: Location[] } | null => {
    return mapCache.get(mapId) || null;
  };

  const storeMapInCache = (mapId: number, gameMap: GameMap, locations: Location[]) => {
    setMapCache(prev => new Map(prev).set(mapId, { gameMap, locations }));
  };

  const clearMapCache = () => {
    setMapCache(new Map());
  };

  const value: GameContextType = {
    currentSave: currentGame,
    setCurrentSave: setCurrentGame,
    isSaveLoaded: currentGame !== null,
    updatePlayerCurrency,
    advanceGameTime,
    getCurrentGameTime,
    getCurrentTimeString,
    getMapInfo,
    getMapFromCache,
    storeMapInCache,
    clearMapCache,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 