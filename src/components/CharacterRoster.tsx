import React from 'react';
import './CharacterRoster.css';

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
  characters: Character[];
  rosterType: 'player' | 'enemy';
  onAction?: (action: string) => void;
  showActions?: boolean;
}

const CharacterRoster: React.FC<CharacterRosterProps> = ({ 
  title, 
  characters, 
  rosterType, 
  onAction, 
  showActions = false 
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

  const getCharacterClass = (character: Character): string => {
    const baseClass = 'character-card';
    if (rosterType === 'player') {
      return `${baseClass} ${character.isPlayer ? 'player-character' : 'ally-character'}`;
    } else {
      return `${baseClass} ${!character.isAlive ? 'enemy-defeated' : ''}`;
    }
  };

  const getBorderColor = (): string => {
    return rosterType === 'player' ? '#4CAF50' : '#f44336';
  };

  return (
    <div className={`character-roster-container ${getRosterClass()}`}>
      <h2 className="character-roster-title">{title}</h2>
      <div className="character-roster-content">
        {characters.map((character) => (
          <div key={character.id} className={getCharacterClass(character)}>
            <div className="character-header">
              <h3 className="character-name">{character.name}</h3>
              <div className="character-info">
                <span className="character-level">Lv.{character.level}</span>
                {rosterType === 'enemy' && (
                  <span 
                    className="character-threat"
                    style={{ color: getThreatColor(character.level) }}
                  >
                    {getThreatLevel(character.level)}
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
                      width: `${getHealthPercentage(character.health, character.maxHealth)}%`,
                      backgroundColor: getHealthColor(getHealthPercentage(character.health, character.maxHealth))
                    }}
                  />
                </div>
                <div className="health-text">
                  {character.health}/{character.maxHealth}
                </div>
              </div>
            </div>
            
            {showActions && character.isPlayer && character.isAlive && (
              <div className="character-actions">
                <button 
                  className="action-button attack-button"
                  onClick={() => handleAction('Attack', character.name)}
                >
                  Attack
                </button>
                <button 
                  className="action-button defend-button"
                  onClick={() => handleAction('Defend', character.name)}
                >
                  Defend
                </button>
                <button 
                  className="action-button special-button"
                  onClick={() => handleAction('Special', character.name)}
                >
                  Special
                </button>
              </div>
            )}
            
            {!character.isAlive && (
              <div className="character-status">
                <span className="status-dead">
                  {rosterType === 'player' ? 'KO' : 'Defeated'}
                </span>
              </div>
            )}
            
            {rosterType === 'enemy' && character.isAlive && (
              <div className="character-status">
                <span className="status-alive">Active</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {rosterType === 'enemy' && (
        <div className="character-summary">
          <div className="summary-item">
            <span className="summary-label">Total Enemies:</span>
            <span className="summary-value">{characters.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Alive:</span>
            <span className="summary-value">{characters.filter(c => c.isAlive).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Defeated:</span>
            <span className="summary-value">{characters.filter(c => !c.isAlive).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterRoster;
