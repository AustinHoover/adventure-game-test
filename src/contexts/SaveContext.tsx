import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SaveFile } from '../game/interface/save-interfaces';

interface SaveContextType {
  currentSave: SaveFile | null;
  setCurrentSave: (save: SaveFile | null) => void;
  isSaveLoaded: boolean;
  updatePlayerCurrency: (amount: number) => void;
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

  const value: SaveContextType = {
    currentSave,
    setCurrentSave,
    isSaveLoaded: currentSave !== null,
    updatePlayerCurrency,
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