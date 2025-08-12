import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GameMapVisualizer from '../components/Explore/GameMapVisualizer';
import Status from '../components/Explore/Status';
import NearbyItems from '../components/Explore/NearbyItems';
import ButtonGrid from '../components/ButtonGrid';
import GameClock from '../components/Explore/GameClock';
import type { GameMap, Location, MapObject } from '../game/interface/map';
import type { Character } from '../game/interface/character';
import { generateTestArea } from '../game/gen/map/mapgen';
import { useGame } from '../contexts/GameContext';
import { saveSaveFile, loadMapFile } from '../utils/saveFileOperations';
import { executeMapObjectCallback } from '../game/interface/mapobject';
import { findPath } from '../utils/pathfinding';
import './Landing.css';

/**
 * Time to wait between each move when moving along a path
 */
const MOVE_DELAY: number = 200;

/**
 * The main explore page
 */
function Explore() {
  const [saving, setSaving] = useState(false);
  const [currentGameMap, setCurrentGameMap] = useState<GameMap | null>(null);
  const [currentLocations, setCurrentLocations] = useState<Location[]>([]);
  const [currentMapObjects, setCurrentMapObjects] = useState<MapObject[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const navigate = useNavigate();
  const { currentSave, setCurrentSave, emit, simulate } = useGame();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if(!currentSave?.mapRegistry?.cachedMaps) {
    console.log("No map registry found");
    return <Link to="/">No map registry found</Link>;
  }

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

      try {
        // First, check if the map is in the in-memory cache (for temporary maps)
        if(currentSave.mapRegistry.cachedMaps.has(playerMapId)) {
          const cachedMap = currentSave.mapRegistry.cachedMaps.get(playerMapId);
          if(cachedMap && cachedMap?.locations) {
            setCurrentGameMap(cachedMap);
            setCurrentLocations(cachedMap.locations);
            setCurrentMapObjects(cachedMap.locations.flatMap(node => node.objects));
          } else {
            throw new Error(`Map ${playerMapId} not found in cached maps`);
          }
          return;
        } else {
          console.log("try to load map from file")
          // Check if the map file exists in the registry
          const mapFileName = currentSave.mapRegistry.mapFiles.get(playerMapId);
          if (mapFileName) {
            // Load the map from file
            const mapData = await loadMapFile(currentSave.name, playerMapId);
            console.log("store in cache")
            currentSave.mapRegistry.cachedMaps.set(playerMapId, mapData);
            emit()
            setMapLoaded(true)
          } else {
            throw new Error(`Map file ${mapFileName} not found`);
          }
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
        // Fallback to test area with objects on error
        const gameMap: GameMap = generateTestArea();
        // Convert GameMapWithObjects to GameMap format for backward compatibility
        setCurrentGameMap(gameMap);
        setCurrentLocations(gameMap.locations);
        setCurrentMapObjects(gameMap.locations.flatMap(location => location.objects));
        if(currentSave?.mapRegistry?.cachedMaps) {
          currentSave.mapRegistry.cachedMaps.set(playerMapId, gameMap);
        } else {
          throw new Error("Map registry cached maps not found");
        }
      }
    };

    loadMapData();
  }, [currentSave, playerCharacter, playerMapId, mapLoaded]);

  /**
   * Move player directly to a specific location (for adjacent movement)
   */
  const movePlayerToLocation = (locationId: number) => {
    if (!currentSave) return;

    const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!playerCharacter) return;

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

    // Update the save file with location change
    const updatedSave = {
      ...currentSave,
      characterRegistry: updatedCharacterRegistry
    };

    setCurrentSave(updatedSave);
    
    // Simulate time advancement for movement (5 minutes)
    simulate(5);
    
    console.log(`Player moved from location ${playerCharacter.location} to location ${locationId}`);
  };

  /**
   * Move player along a path with delays between each step
   */
  const movePlayerAlongPath = (path: number[]) => {
    if (!currentSave || path.length < 2) return;

    const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!playerCharacter) return;

    // Set movement state and current path
    setIsMoving(true);
    setCurrentPath(path);
    setFeedbackMessage(`Moving to ${currentLocations.find(loc => loc.id === path[path.length - 1])?.name || 'destination'}...`);

    // Start from the second location (first is current location)
    let currentPathIndex = 1;

    const moveNextStep = () => {
      if (currentPathIndex >= path.length) {
        console.log(`Path completed. Player arrived at location ${path[path.length - 1]}`);
        setIsMoving(false);
        setCurrentPath([]);
        setFeedbackMessage(`Arrived at ${currentLocations.find(loc => loc.id === path[path.length - 1])?.name || 'destination'}!`);
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }

      const nextLocationId = path[currentPathIndex];
      console.log(`Moving to step ${currentPathIndex}: location ${nextLocationId}`);

      // Move to the next location
      movePlayerToLocation(nextLocationId);
      
      // Schedule next movement
      currentPathIndex++;
      setTimeout(moveNextStep, MOVE_DELAY);
    };

    // Start the movement sequence
    setTimeout(moveNextStep, MOVE_DELAY);
  };

  /**
   * Handle location click - now with pathfinding support
   */
  const handleLocationClick = (locationId: number) => {
    if (!currentSave || isMoving) return; // Prevent clicking while moving

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

    if (isAdjacent) {
      // Direct movement to adjacent location
      movePlayerToLocation(locationId);
    } else {
      // Use pathfinding to find route to distant location
      const path = findPath(currentGameMap!, playerCharacter.location, locationId);
      
      if (path.length === 0) {
        console.log(`No path found to location ${locationId}`);
        setFeedbackMessage(`Cannot reach that location!`);
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }

      console.log(`Path found: ${path.join(' -> ')}`);
      
      // Start moving along the path
      movePlayerAlongPath(path);
    }
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

  const handleMapObjectClick = async (mapObject: MapObject) => {
    console.log('Map object clicked:', mapObject);
    if (mapObject.callback && currentSave) {
      try {
        await executeMapObjectCallback(mapObject, currentSave);
        setFeedbackMessage(`Interacted with ${mapObject.name}`);
        setTimeout(() => setFeedbackMessage(null), 3000); // Clear message after 3 seconds
      } catch (error) {
        console.error('Error executing map object callback:', error);
        setFeedbackMessage(`Error interacting with ${mapObject.name}`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    }
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
    // Conditionally add North movement button if there's a valid north location
    ...(playerCharacter && currentLocation?.north ? [{
      callback: () => {
        if (currentLocation?.north && !isMoving) {
          handleLocationClick(currentLocation.north);
        }
      },
      coordinates: { row: 0, col: 1 },
      text: "North",
      disabled: isMoving
    }] : []),
    // Conditionally add Interact button if there are nearby characters and not at exit
    ...(playerCharacter && nearbyCharacters.length > 0 && !currentLocation?.exit ? [{
      callback: () => {
        const firstCharacter = nearbyCharacters[0];
        if (firstCharacter && !isMoving) {
          handleCharacterClick(firstCharacter);
        }
      },
      coordinates: { row: 0, col: 2 },
      text: `Interact: ${nearbyCharacters[0]?.name || 'Character'}`,
      disabled: isMoving
    }] : []),
    // Conditionally add Exit button if player is on an exit node (takes priority over Interact)
    ...(playerCharacter && currentLocation?.exit ? [{
      callback: () => {
        if (!isMoving) {
          navigate('/journey');
        }
      },
      coordinates: { row: 0, col: 2 },
      text: "Exit",
      disabled: isMoving
    }] : []),
    // Conditionally add West movement button if there's a valid west location
    ...(playerCharacter && currentLocation?.west ? [{
      callback: () => {
        if (currentLocation?.west && !isMoving) {
          handleLocationClick(currentLocation.west);
        }
      },
      coordinates: { row: 1, col: 0 },
      text: "West",
      disabled: isMoving
    }] : []),
    // Conditionally add South movement button if there's a valid south location
    ...(playerCharacter && currentLocation?.south ? [{
      callback: () => {
        if (currentLocation?.south && !isMoving) {
          handleLocationClick(currentLocation.south);
        }
      },
      coordinates: { row: 1, col: 1 },
      text: "South",
      disabled: isMoving
    }] : []),
         // Conditionally add East movement button if there's a valid east location
     ...(playerCharacter && currentLocation?.east ? [{
       callback: () => {
         if (currentLocation?.east && !isMoving) {
           handleLocationClick(currentLocation.east);
         }
       },
       coordinates: { row: 1, col: 2 },
       text: "East",
       disabled: isMoving
     }] : []),
     // Wait button - always available if player character exists
     ...(playerCharacter ? [{
       callback: () => {
         if (!isMoving) {
           // Simulate waiting for 5 minutes
           simulate(5);
           setFeedbackMessage("Waited 5 minutes");
           setTimeout(() => setFeedbackMessage(null), 2000);
         }
       },
       coordinates: { row: 1, col: 3 },
       text: "Wait",
       disabled: isMoving
     }] : []),
     // Save button - always available
     {
       callback: handleSaveAndQuit,
       coordinates: { row: 2, col: 0 },
       text: "Save & Quit"
     },
     // Inventory button - always available
     {
       callback: () => navigate('/inventory'),
       coordinates: { row: 2, col: 1 },
       text: "Inventory"
     },
     // Shop button - always available
     {
       callback: () => navigate('/shop'),
       coordinates: { row: 2, col: 2 },
       text: "Shop"
     },
     // Combat button - always available
     {
       callback: () => navigate('/combat'),
       coordinates: { row: 2, col: 3 },
       text: "Combat"
     }
   ], [playerCharacter, currentLocation, navigate, handleLocationClick, nearbyCharacters, handleCharacterClick, isMoving, currentSave]);

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
        {/* Feedback Message */}
        {feedbackMessage && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInOut 0.3s ease-in-out'
          }}>
            {feedbackMessage}
          </div>
        )}

        {/* Game Clock Component - New Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <GameClock gameTime={currentSave?.worldState?.gameTime || 360} />
        </div>

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
              gameMap={currentGameMap!}
              locations={currentLocations}
              playerLocationId={playerCharacter?.location}
              onLocationClick={handleLocationClick}
              currentPath={currentPath}
              isMoving={isMoving}
            />
          </div>

          {/* Nearby Items Component */}
          <div style={{ flex: '0 0 250px' }}>
                          <NearbyItems 
                playerCharacter={currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)}
                allCharacters={Array.from(currentSave?.characterRegistry.characters.values() || [])}
                mapObjects={currentMapObjects}
                onCharacterClick={handleCharacterClick}
                onMapObjectClick={handleMapObjectClick}
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