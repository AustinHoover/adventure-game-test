import React from 'react';
import type { Character } from '../../game/interface/character';
import type { MapObject } from '../../game/interface/map';
import { hasMapObjectCallback, getMapObjectCallbackDescription } from '../../game/interface/mapobject';
import './NearbyItems.css';

interface NearbyItemsProps {
  playerCharacter?: Character;
  allCharacters: Character[];
  mapObjects?: MapObject[];
  onCharacterClick?: (character: Character) => void;
  onMapObjectClick?: (mapObject: MapObject) => void;
}

const NearbyItems: React.FC<NearbyItemsProps> = ({ 
  playerCharacter, 
  allCharacters, 
  mapObjects = [], 
  onCharacterClick, 
  onMapObjectClick 
}) => {
  if (!playerCharacter) {
    return (
      <div className="nearby-items-container">
        <h3>Nearby Items</h3>
        <div className="nearby-content">
          <p className="no-character">No character loaded</p>
        </div>
      </div>
    );
  }

  // Find characters in the same location as the player
  const nearbyCharacters = allCharacters.filter(character => 
    character.id !== playerCharacter.id && // Exclude the player themselves
    character.location === playerCharacter.location &&
    character.mapId === playerCharacter.mapId
  );

  // Filter map objects to only show those at the player's current location
  const nearbyMapObjects = mapObjects.filter(obj => 
    obj.locationId === playerCharacter.location
  );

  const hasNearbyCharacters = nearbyCharacters.length > 0;
  const hasNearbyObjects = nearbyMapObjects.length > 0;

  return (
    <div className="nearby-items-container">
      <h3>Nearby Items</h3>
      <div className="nearby-content">
        {!hasNearbyCharacters && !hasNearbyObjects ? (
          <p className="no-items">Nothing nearby</p>
        ) : (
          <>
            {/* Map Objects Section */}
            {hasNearbyObjects && (
              <div className="map-objects-section">
                <h4>Objects:</h4>
                <ul className="map-objects-list">
                  {nearbyMapObjects.map(mapObject => {
                    const hasCallback = hasMapObjectCallback(mapObject);
                    const callbackDescription = hasCallback ? getMapObjectCallbackDescription(mapObject) : null;
                    return (
                      <li 
                        key={mapObject.id} 
                        className={`map-object-item ${hasCallback ? 'clickable-object has-callback' : 'clickable-object'}`}
                        onClick={() => onMapObjectClick?.(mapObject)}
                        style={{ cursor: hasCallback ? 'pointer' : 'default' }}
                        title={hasCallback ? `${callbackDescription || 'Interact'}: ${mapObject.name}` : mapObject.name}
                      >
                        <span className="object-name">{mapObject.name}</span>
                        <span className="object-type">({mapObject.type})</span>
                        {hasCallback && <span className="callback-indicator" title={callbackDescription || 'Interact'}>⚡</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Characters Section */}
            {hasNearbyCharacters && (
              <div className="character-list">
                <h4>Characters:</h4>
                <ul>
                  {nearbyCharacters.map(character => (
                    <li 
                      key={character.id} 
                      className="character-item clickable-character"
                      onClick={() => onCharacterClick?.(character)}
                      style={{ cursor: 'pointer' }}
                    >
                      {character.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NearbyItems; 