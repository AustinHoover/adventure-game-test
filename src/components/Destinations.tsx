import React, { useState, useEffect } from 'react';
import './Destinations.css';
import { useGame } from '../contexts/GameContext';
import { GameMap } from '../game/interface/map-interfaces';
import { loadMapFile } from '../utils/saveFileOperations';

interface DestinationsProps {
  onDestinationClick?: (destinationName: string, mapId?: number) => void;
  disabled?: boolean;
}

interface Destination {
  id: number;
  name: string;
  type: 'explore' | 'map' | 'search';
}

const Destinations: React.FC<DestinationsProps> = ({ onDestinationClick, disabled = false }) => {
  const { currentSave } = useGame();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

  // Get all available maps from the save file
  const loadAvailableMaps = async () => {
    if (!currentSave) {
      setDestinations([]);
      return;
    }

    setLoading(true);
    const maps: Destination[] = [];
    
    // Add the Explore option at the top
    maps.push({ id: 0, name: 'Explore', type: 'explore' });
    
    // Add the Search option
    maps.push({ id: -1, name: 'Search', type: 'search' });
    
    // Load actual map names for all available maps
    const mapPromises = Array.from(currentSave.mapRegistry.mapFiles.keys()).map(async (mapId) => {
      try {
        const mapData = await loadMapFile(currentSave.name, mapId);
        const mapInfo = {
          name: mapData.gameMap.name,
          id: mapData.gameMap.id
        };
        if (mapInfo) {
          return { id: mapId, name: mapInfo.name, type: 'map' as const };
        } else {
          return { id: mapId, name: `Map ${mapId}`, type: 'map' as const };
        }
      } catch (error) {
        console.error(`Failed to load map info for map ${mapId}:`, error);
        return { id: mapId, name: `Map ${mapId}`, type: 'map' as const };
      }
    });

    try {
      const mapResults = await Promise.all(mapPromises);
      maps.push(...mapResults);
      setDestinations(maps);
    } catch (error) {
      console.error('Failed to load map information:', error);
      // Fallback to basic map names
      currentSave.mapRegistry.mapFiles.forEach((filename, mapId) => {
        maps.push({ id: mapId, name: `Map ${mapId}`, type: 'map' });
      });
      setDestinations(maps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableMaps();
  }, [currentSave]);

  const handleDestinationClick = (destination: Destination) => {
    if (onDestinationClick && !disabled) {
      if (destination.type === 'explore') {
        onDestinationClick(destination.name);
      } else if (destination.type === 'search') {
        onDestinationClick(destination.name, destination.id);
      } else {
        onDestinationClick(destination.name, destination.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="destinations-container">
        <h2 className="destinations-title">Destinations</h2>
        <div className="destinations-list">
          <div className="destination-item loading">Loading maps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="destinations-container">
      <h2 className="destinations-title">Destinations</h2>
      <div className="destinations-list">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className={`destination-item ${disabled ? 'disabled' : ''} ${destination.type === 'explore' ? 'explore-option' : destination.type === 'search' ? 'search-option' : 'map-option'}`}
            onClick={() => handleDestinationClick(destination)}
            style={{ 
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1 
            }}
          >
            <span className="destination-name">{destination.name}</span>
            {destination.type === 'map' && (
              <span className="destination-type">Map</span>
            )}
            {destination.type === 'search' && (
              <span className="destination-type">Search</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
