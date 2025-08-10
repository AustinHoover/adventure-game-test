import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SaveFile } from '../game/interface/save-interfaces';
import { incrementGameTime } from '../utils/timeManager';

interface SaveContextType {
  currentSave: SaveFile | null;
  setCurrentSave: (save: SaveFile | null) => void;
  isSaveLoaded: boolean;
  updatePlayerCurrency: (amount: number) => void;
  advanceGameTime: (minutes: number) => void;
  getCurrentGameTime: () => number;
  getCurrentTimeString: () => string;
}

const SaveContext = createContext<SaveContextType | undefined>(undefined);

interface SaveProviderProps {
  children: ReactNode;
}

export const SaveProvider: React.FC<SaveProviderProps> = ({ children }) => {
  const [currentSave, setCurrentSave] = useState<SaveFile | null>(null);

  const updatePlayerCurrency = (amount: number) => {
    if (currentSave) {
      const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
      if (playerCharacter) {
        const newCurrency = Math.max(0, playerCharacter.inventory.currency + amount);
        playerCharacter.inventory.currency = newCurrency;
        
        // Create a new save object to trigger re-renders
        setCurrentSave({ ...currentSave });
      }
    }
  };

  const advanceGameTime = (minutes: number) => {
    if (currentSave) {
      // Get the player character for simulation effects
      const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
      
      // Use the centralized time management system
      const newTime = incrementGameTime(currentSave.gameTime, minutes, playerCharacter);
      
      const updatedSave = {
        ...currentSave,
        gameTime: newTime
      };
      setCurrentSave(updatedSave);
    }
  };

  const getCurrentGameTime = (): number => {
    return currentSave?.gameTime || 360; // Default to 6:00 AM if no save
  };

  const getCurrentTimeString = (): string => {
    const time = getCurrentGameTime();
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const value: SaveContextType = {
    currentSave,
    setCurrentSave,
    isSaveLoaded: currentSave !== null,
    updatePlayerCurrency,
    advanceGameTime,
    getCurrentGameTime,
    getCurrentTimeString,
  };

  return (
    <SaveContext.Provider value={value}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSave = (): SaveContextType => {
  const context = useContext(SaveContext);
  if (context === undefined) {
    throw new Error('useSave must be used within a SaveProvider');
  }
  return context;
}; 