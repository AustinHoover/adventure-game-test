import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SaveFile } from '../game/save-interfaces';

interface SaveContextType {
  currentSave: SaveFile | null;
  setCurrentSave: (save: SaveFile | null) => void;
  isSaveLoaded: boolean;
}

const SaveContext = createContext<SaveContextType | undefined>(undefined);

interface SaveProviderProps {
  children: ReactNode;
}

export const SaveProvider: React.FC<SaveProviderProps> = ({ children }) => {
  const [currentSave, setCurrentSave] = useState<SaveFile | null>(null);

  const value: SaveContextType = {
    currentSave,
    setCurrentSave,
    isSaveLoaded: currentSave !== null,
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