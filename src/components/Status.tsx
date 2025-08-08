import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Character } from '../game/interface/character-interfaces';
import './Status.css';

interface StatusProps {
  playerCharacter?: Character;
}

const Status: React.FC<StatusProps> = ({ playerCharacter }) => {
  const navigate = useNavigate();

  const handleInventoryClick = () => {
    navigate('/inventory', { state: { playerCharacter } });
  };

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
        <div className="status-item">
          <span className="status-label">Currency:</span>
          <span className="status-value">{playerCharacter.inventory.currency}</span>
        </div>
        
        <button
          onClick={handleInventoryClick}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          🎒 Inventory
        </button>
      </div>
    </div>
  );
};

export default Status;