import React, { useState, useEffect } from 'react';
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
        <ButtonGrid items={[
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
          // Conditionally add Exit button if player is on an exit node
          ...(playerCharacter && currentLocation?.exit ? [{
            callback: () => {
              navigate('/journey');
            },
            coordinates: { row: 0, col: 2 },
            text: "Exit"
          }] : [])
        ]} />
        
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