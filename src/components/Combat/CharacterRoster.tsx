import React from 'react';
import './CharacterRoster.css';
import { CombatUnit } from '../../game/interface/combat-unit-service';

// Keep the old Character interface for backward compatibility if needed
export interface Character {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  level: number;
  isPlayer: boolean;
  isAlive: boolean;
}

export interface CharacterRosterProps {
  title: string;
  characters: Character[] | CombatUnit[]; // Support both old and new formats
  rosterType: 'player' | 'enemy';
  onAction?: (action: string) => void;
  showActions?: boolean;
  onCharacterClick?: (character: Character | CombatUnit) => void; // Added click handler
  selectedCharacterId?: number; // Added to highlight selected character
  targetingMode?: boolean; // Added to show targeting mode visual feedback
  actingEnemyId?: number | null; // Added to show which enemy is currently acting
}

// Utility functions to normalize data between old Character and new CombatUnit formats
const isCombatUnit = (char: Character | CombatUnit): char is CombatUnit => {
  return 'characterId' in char && 'maxHp' in char;
};

const getNormalizedCharacter = (char: Character | CombatUnit) => {
  if (isCombatUnit(char)) {
    return {
      id: char.id.toString(),
      name: char.name,
      health: char.currentHp,
      maxHealth: char.maxHp,
      level: char.level,
      isPlayer: char.isPlayer,
      isAlive: char.isAlive,
      attack: char.attack, // Additional field for combat units
      raceId: char.raceId // Additional field for combat units
    };
  } else {
    return {
      id: char.id,
      name: char.name,
      health: char.health,
      maxHealth: char.maxHealth,
      level: char.level,
      isPlayer: char.isPlayer,
      isAlive: char.isAlive,
      attack: undefined,
      raceId: undefined
    };
  }
};

const CharacterRoster: React.FC<CharacterRosterProps> = ({
  title,
  characters,
  rosterType,
  onAction,
  showActions = false,
  onCharacterClick,
  selectedCharacterId,
  targetingMode = false,
  actingEnemyId = null
}) => {
  const handleAction = (action: string, characterName: string) => {
    if (onAction) {
      onAction(`${characterName} performs ${action}`);
    }
  };

  const getHealthPercentage = (health: number, maxHealth: number): number => {
    return Math.max(0, Math.min(100, (health / maxHealth) * 100));
  };

  const getHealthColor = (percentage: number): string => {
    if (percentage > 60) return '#4CAF50';
    if (percentage > 30) return '#FF9800';
    return '#F44336';
  };

  const getThreatLevel = (level: number): string => {
    if (level <= 2) return 'Low';
    if (level <= 4) return 'Medium';
    if (level <= 6) return 'High';
    return 'Extreme';
  };

  const getThreatColor = (level: number): string => {
    if (level <= 2) return '#4CAF50';
    if (level <= 4) return '#FF9800';
    if (level <= 6) return '#F44336';
    return '#9C27B0';
  };

  const getRosterClass = (): string => {
    return rosterType === 'player' ? 'player-roster' : 'enemy-roster';
  };

  const getCharacterClass = (character: Character | CombatUnit): string => {
    const normalized = getNormalizedCharacter(character);
    const baseClass = 'character-card';
    if (rosterType === 'player') {
      return `${baseClass} ${normalized.isPlayer ? 'player-character' : 'ally-character'}`;
    } else {
      return `${baseClass} ${!normalized.isAlive ? 'enemy-defeated' : ''}`;
    }
  };

  const getBorderColor = (): string => {
    return rosterType === 'player' ? '#4CAF50' : '#f44336';
  };

  return (
    <div className={`character-roster-container ${getRosterClass()}`}>
      <h2 className="character-roster-title">{title}</h2>
      <div className="character-roster-content">
        {characters.map((character) => {
          const normalized = getNormalizedCharacter(character);
          return (
            <div 
              key={normalized.id} 
              className={`${getCharacterClass(character)} ${isCombatUnit(character) && actingEnemyId === character.id ? 'acting-enemy' : ''}`}
              onClick={() => onCharacterClick && onCharacterClick(character)}
              style={{ 
                cursor: onCharacterClick ? 'pointer' : 'default',
                border: isCombatUnit(character) && selectedCharacterId === character.id 
                  ? '2px solid #ffd700' 
                  : targetingMode && isCombatUnit(character) && character.isAlive
                  ? '2px solid #ff6b6b'
                  : isCombatUnit(character) && actingEnemyId === character.id
                  ? '2px solid #ff6b35'
                  : undefined,
                boxShadow: isCombatUnit(character) && selectedCharacterId === character.id 
                  ? '0 0 10px rgba(255, 215, 0, 0.5)' 
                  : targetingMode && isCombatUnit(character) && character.isAlive
                  ? '0 0 10px rgba(255, 107, 107, 0.3)'
                  : isCombatUnit(character) && actingEnemyId === character.id
                  ? '0 0 15px rgba(255, 107, 53, 0.8)'
                  : undefined,
                backgroundColor: targetingMode && isCombatUnit(character) && character.isAlive
                  ? 'rgba(255, 107, 107, 0.1)'
                  : isCombatUnit(character) && actingEnemyId === character.id
                  ? 'rgba(255, 107, 53, 0.2)'
                  : undefined
              }}
            >
              <div className="character-header">
                <div className="character-name-section">
                  {isCombatUnit(character) && actingEnemyId === character.id && (
                    <div className="acting-indicator">🎯 ACTING</div>
                  )}
                  <h3 className="character-name">{normalized.name}</h3>
                </div>
                <div className="character-info">
                  <span className="character-level">Lv.{normalized.level}</span>
                  {rosterType === 'enemy' && (
                    <span 
                      className="character-threat"
                      style={{ color: getThreatColor(normalized.level) }}
                    >
                      {getThreatLevel(normalized.level)}
                    </span>
                  )}
                  {normalized.raceId && (
                    <span className="character-race" style={{ fontSize: '0.8rem', color: '#aaa' }}>
                      {normalized.raceId}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="character-stats">
                <div className="health-bar-container">
                  <div className="health-label">HP</div>
                  <div className="health-bar">
                    <div 
                      className="health-fill"
                      style={{
                        width: `${getHealthPercentage(normalized.health, normalized.maxHealth)}%`,
                        backgroundColor: getHealthColor(getHealthPercentage(normalized.health, normalized.maxHealth))
                      }}
                    />
                  </div>
                  <div className="health-text">
                    {normalized.health}/{normalized.maxHealth}
                  </div>
                </div>
                {normalized.attack !== undefined && (
                  <div className="attack-stat">
                    <span className="attack-label">ATK: </span>
                    <span className="attack-value">{normalized.attack}</span>
                  </div>
                )}
              </div>
              

            </div>
          );
        })}
      </div>
      

    </div>
  );
};

export default CharacterRoster;
