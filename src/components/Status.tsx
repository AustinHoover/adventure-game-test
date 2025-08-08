import React from 'react';
import { Character } from '../game/interface/character-interfaces';
import './Status.css';

interface StatusProps {
  playerCharacter?: Character;
}

const Status: React.FC<StatusProps> = ({ playerCharacter }) => {
  if (!playerCharacter) {
    return (
      <div className="status-container">
        <h3>Character Status</h3>
        <div className="status-content">
          <p className="no-character">No character loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-container">
      <h3>Character Status</h3>
      <div className="status-content">
        <div className="status-item">
          <span className="status-label">Name:</span>
          <span className="status-value">{playerCharacter.name}</span>
        </div>
      </div>
    </div>
  );
};

export default Status;