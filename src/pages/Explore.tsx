import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GameMapVisualizer from '../components/GameMapVisualizer';
import Status from '../components/Status';
import NearbyItems from '../components/NearbyItems';
import ButtonGrid from '../components/ButtonGrid';
import type { GameMap, Location } from '../game/interface/map-interfaces';
import type { Character } from '../game/interface/character-interfaces';
import { generateTestArea } from '../game/gen/mapgen';
import { useSave } from '../contexts/SaveContext';
import { saveSaveFile, loadMapFile } from '../utils/saveFileOperations';
import './Landing.css';

function Explore() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [appName, setAppName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [currentGameMap, setCurrentGameMap] = useState<GameMap | null>(null);
  const [currentLocations, setCurrentLocations] = useState<Location[]>([]);
  const navigate = useNavigate();
  const { currentSave, setCurrentSave } = useSave();

  // Keyboard to grid position mapping (QWERTY layout)
  // Grid is 6 columns x 3 rows
  const keyboardMapping: Record<string, { row: number; col: number }> = {
    // Row 0: Q W E R T Y
    'q': { row: 0, col: 0 },
    'w': { row: 0, col: 1 },
    'e': { row: 0, col: 2 },
    'r': { row: 0, col: 3 },
    't': { row: 0, col: 4 },
    'y': { row: 0, col: 5 },
    // Row 1: A S D F G H
    'a': { row: 1, col: 0 },
    's': { row: 1, col: 1 },
    'd': { row: 1, col: 2 },
    'f': { row: 1, col: 3 },
    'g': { row: 1, col: 4 },
    'h': { row: 1, col: 5 },
    // Row 2: Z X C V B N
    'z': { row: 2, col: 0 },
    'x': { row: 2, col: 1 },
    'c': { row: 2, col: 2 },
    'v': { row: 2, col: 3 },
    'b': { row: 2, col: 4 },
    'n': { row: 2, col: 5 },
  };

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

  // Get player's current map and locations from save file or generate if not available
  const playerCharacter = currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId);
  const playerMapId = playerCharacter?.mapId || 1;
  
  // Get the player's current location
  const currentLocation = playerCharacter ? currentLocations.find((loc: Location) => loc.id === playerCharacter.location) : null;

  // Load map data when player character or map ID changes
  useEffect(() => {
    const loadMapData = async () => {
      if (!currentSave || !playerCharacter) {
        // Fallback to test area if no save or player
        const testData = generateTestArea();
        setCurrentGameMap(testData.gameMap);
        setCurrentLocations(testData.locations);
        return;
      }

      try {
        // Check if the map file exists in the registry
        const mapFileName = currentSave.mapRegistry.mapFiles.get(playerMapId);
        if (mapFileName) {
          // Load the map from file
          const mapData = await loadMapFile(currentSave.name, playerMapId);
          setCurrentGameMap(mapData.gameMap);
          setCurrentLocations(mapData.locations);
        } else {
          // Fallback to test area if map not found
          const testData = generateTestArea();
          setCurrentGameMap(testData.gameMap);
          setCurrentLocations(testData.locations);
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
        // Fallback to test area on error
        const testData = generateTestArea();
        setCurrentGameMap(testData.gameMap);
        setCurrentLocations(testData.locations);
      }
    };

    loadMapData();
  }, [currentSave, playerCharacter, playerMapId]);

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

    const currentLocation = currentLocations.find((loc: Location) => loc.id === playerCharacter.location);
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

  const handleCharacterClick = (character: Character) => {
    console.log('Character clicked:', character);
    navigate('/interaction', { state: { selectedCharacter: character } });
  };

  // Get nearby characters for interaction button
  const nearbyCharacters = useMemo(() => {
    if (!playerCharacter || !currentSave) return [];
    
    const allCharacters = Array.from(currentSave.characterRegistry.characters.values());
    return allCharacters.filter(character => 
      character.id !== playerCharacter.id && // Exclude the player themselves
      character.location === playerCharacter.location &&
      character.mapId === playerCharacter.mapId
    );
  }, [playerCharacter, currentSave]);

  // Create button items array with useMemo to avoid recreation on every render
  const buttonItems = useMemo(() => [
    {
      callback: () => console.log("hello"),
      coordinates: { row: 0, col: 0 },
      text: "test"
    },
    // Conditionally add North movement button if there's a valid north location
    ...(playerCharacter && currentLocation?.north ? [{
      callback: () => {
        if (currentLocation?.north) {
          handleLocationClick(currentLocation.north);
        }
      },
      coordinates: { row: 0, col: 1 },
      text: "North"
    }] : []),
    // Conditionally add Interact button if there are nearby characters and not at exit
    ...(playerCharacter && nearbyCharacters.length > 0 && !currentLocation?.exit ? [{
      callback: () => {
        const firstCharacter = nearbyCharacters[0];
        if (firstCharacter) {
          handleCharacterClick(firstCharacter);
        }
      },
      coordinates: { row: 0, col: 2 },
      text: `Interact: ${nearbyCharacters[0]?.name || 'Character'}`
    }] : []),
    // Conditionally add Exit button if player is on an exit node (takes priority over Interact)
    ...(playerCharacter && currentLocation?.exit ? [{
      callback: () => {
        navigate('/journey');
      },
      coordinates: { row: 0, col: 2 },
      text: "Exit"
    }] : []),
    // Conditionally add West movement button if there's a valid west location
    ...(playerCharacter && currentLocation?.west ? [{
      callback: () => {
        if (currentLocation?.west) {
          handleLocationClick(currentLocation.west);
        }
      },
      coordinates: { row: 1, col: 0 },
      text: "West"
    }] : []),
    // Conditionally add South movement button if there's a valid south location
    ...(playerCharacter && currentLocation?.south ? [{
      callback: () => {
        if (currentLocation?.south) {
          handleLocationClick(currentLocation.south);
        }
      },
      coordinates: { row: 1, col: 1 },
      text: "South"
    }] : []),
    // Conditionally add East movement button if there's a valid east location
    ...(playerCharacter && currentLocation?.east ? [{
      callback: () => {
        if (currentLocation?.east) {
          handleLocationClick(currentLocation.east);
        }
      },
      coordinates: { row: 1, col: 2 },
      text: "East"
    }] : []),
    // Inventory button - always available if player character exists
    ...(playerCharacter ? [{
      callback: () => {
        navigate('/inventory', { state: { playerCharacter } });
      },
      coordinates: { row: 2, col: 3 },
      text: "Inventory"
    }] : [])
  ], [playerCharacter, currentLocation, navigate, handleLocationClick, nearbyCharacters, handleCharacterClick]);

  // Keyboard event handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const gridPosition = keyboardMapping[key];
    
    if (!gridPosition) {
      return; // Key not mapped to any grid position
    }

    // Find the button item at this grid position
    const buttonItem = buttonItems.find(item => 
      item.coordinates && 
      item.coordinates.row === gridPosition.row && 
      item.coordinates.col === gridPosition.col
    );

    // Execute the button's callback if it exists and is enabled
    if (buttonItem && buttonItem.callback) {
      event.preventDefault(); // Prevent default browser behavior
      buttonItem.callback();
      console.log(`Keyboard shortcut: ${key.toUpperCase()} pressed - executed button at row ${gridPosition.row}, col ${gridPosition.col}: "${buttonItem.text}"`);
    }
  }, [keyboardMapping, buttonItems]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event);
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  return (
    <div className="Landing">
      <div className="landing-container">
        {/* Status, Map, and Nearby Items Layout */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexWrap: 'nowrap',
          width: '100%',
          maxWidth: '1400px',
          marginBottom: '1rem' // Add some space below the panels
        }}>
          {/* Status Component */}
          <div style={{ flex: '0 0 250px' }}>
            <Status 
              playerCharacter={currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)}
            />
          </div>
          
                     {/* Game Map Component */}
           <div style={{ flex: '1 1 auto' }}>
             <GameMapVisualizer 
               gameMap={currentGameMap || generateTestArea().gameMap} 
               locations={currentLocations} 
               playerLocationId={currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.location}
               onLocationClick={handleLocationClick}
             />
           </div>

          {/* Nearby Items Component */}
          <div style={{ flex: '0 0 250px' }}>
            <NearbyItems 
              playerCharacter={currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)}
              allCharacters={Array.from(currentSave?.characterRegistry.characters.values() || [])}
              onCharacterClick={handleCharacterClick}
            />
          </div>
        </div>

        {/* Button Grid Component */}
        <ButtonGrid items={buttonItems} />
        
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