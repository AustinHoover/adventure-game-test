import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameMapVisualizer from '../components/GameMap';
import Status from '../components/Status';
import type { GameMap, Location, Character } from '../game/interfaces';
import { generateTestArea } from '../game/mapgen';
import { useSave } from '../contexts/SaveContext';
import { saveSaveFile } from '../utils/saveFileOperations';
import './Landing.css';

function Explore() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [appName, setAppName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { currentSave, setCurrentSave } = useSave();

  // Debug logging
  useEffect(() => {
    if (currentSave) {
      console.log('Current save loaded:', currentSave);
      console.log('Player character ID:', currentSave.playerCharacterId);
      console.log('Character registry:', currentSave.characterRegistry);
      const playerChar = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
      console.log('Player character:', playerChar);
      console.log('Player location:', playerChar?.location);
    }
  }, [currentSave]);

  // Generate test area
  const { gameMap, locations } = generateTestArea();

  useEffect(() => {
    // Get app information from Electron main process
    const getAppInfo = async () => {
      try {
        if (window.electronAPI) {
          const version = await window.electronAPI.getAppVersion();
          const name = await window.electronAPI.getAppName();
          setAppVersion(version);
          setAppName(name);
        }
      } catch (error) {
        console.error('Error getting app info:', error);
      }
    };

    getAppInfo();
  }, []);

  const handleGetStarted = () => {
    // Navigate to the main app or another page
    navigate('/app');
  };

  const handleLocationClick = (locationId: number) => {
    if (!currentSave) return;

    const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!playerCharacter) return;

    const currentLocation = locations.find(loc => loc.id === playerCharacter.location);
    if (!currentLocation) return;

    // Check if the clicked location is adjacent to the current location
    const isAdjacent = 
      currentLocation.north === locationId ||
      currentLocation.east === locationId ||
      currentLocation.south === locationId ||
      currentLocation.west === locationId;

    if (!isAdjacent) {
      console.log(`Cannot travel to location ${locationId} - not adjacent to current location ${playerCharacter.location}`);
      return;
    }

    // Update the player's location
    const updatedCharacter = {
      ...playerCharacter,
      location: locationId
    };

    // Update the character registry
    const updatedCharacters = new Map(currentSave.characterRegistry.characters);
    updatedCharacters.set(currentSave.playerCharacterId, updatedCharacter);
    
    const updatedCharacterRegistry = {
      ...currentSave.characterRegistry,
      characters: updatedCharacters
    };

    // Update the save file
    const updatedSave = {
      ...currentSave,
      characterRegistry: updatedCharacterRegistry
    };

    setCurrentSave(updatedSave);
    console.log(`Player moved from location ${playerCharacter.location} to location ${locationId}`);
  };

  const handleSaveAndQuit = async () => {
    if (!currentSave) {
      // If no save is loaded, just go back to menu
      navigate('/');
      return;
    }

    try {
      setSaving(true);
      
      // Update the lastOpened timestamp before saving
      const updatedSave = {
        ...currentSave,
        lastOpened: new Date().toISOString()
      };
      
      // Save the current save file
      await saveSaveFile(updatedSave);
      console.log('Save file saved successfully before quitting');
      
      // Navigate back to the landing page
      navigate('/');
    } catch (error) {
      console.error('Failed to save before quitting:', error);
      // Still navigate back even if save fails
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="Landing">
      <div className="landing-container">
        {/* Status and Map Layout */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Status Component */}
          <Status 
            playerCharacter={currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)}
          />
          
          {/* Game Map Component */}
          <GameMapVisualizer 
            gameMap={gameMap} 
            locations={locations} 
            playerLocationId={currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.location}
            onLocationClick={handleLocationClick}
          />
        </div>
        
        {/* Back to Menu Button */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100
        }}>
                     <button
             className="menu-button"
             onClick={handleSaveAndQuit}
             disabled={saving}
             style={{
               backgroundColor: 'rgba(0, 0, 0, 0.7)',
               color: 'white',
               padding: '0.75rem 1.5rem',
               fontSize: '1rem',
               border: '1px solid rgba(255, 255, 255, 0.3)',
               borderRadius: '8px',
               cursor: saving ? 'not-allowed' : 'pointer',
               backdropFilter: 'blur(10px)',
               transition: 'all 0.2s ease',
               opacity: saving ? 0.7 : 1
             }}
             onMouseEnter={(e) => {
               if (!saving) {
                 e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                 e.currentTarget.style.transform = 'scale(1.05)';
               }
             }}
             onMouseLeave={(e) => {
               if (!saving) {
                 e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                 e.currentTarget.style.transform = 'scale(1)';
               }
             }}
           >
             {saving ? 'Saving...' : '💾 Save and Quit'}
           </button>
        </div>
      </div>
    </div>
  );
}

export default Explore; 