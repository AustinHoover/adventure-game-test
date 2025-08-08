import React from 'react';
import type { Character } from '../game/character-interfaces';
import './NearbyItems.css';

interface NearbyItemsProps {
  playerCharacter?: Character;
  allCharacters: Character[];
}

const NearbyItems: React.FC<NearbyItemsProps> = ({ playerCharacter, allCharacters }) => {
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

  return (
    <div className="nearby-items-container">
      <h3>Nearby Items</h3>
      <div className="nearby-content">
        {nearbyCharacters.length === 0 ? (
          <p className="no-items">No other characters nearby</p>
        ) : (
          <div className="character-list">
            <h4>Characters:</h4>
            <ul>
              {nearbyCharacters.map(character => (
                <li key={character.id} className="character-item">
                  {character.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyItems; 