import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Character } from '../game/interface/character-interfaces';

interface LocationState {
  selectedCharacter?: Character;
}

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCharacter } = (location.state as LocationState) || {};

  const handleBack = () => {
    navigate('/interaction', { state: { selectedCharacter } });
  };

  return (
    <div className="shop-container" style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <h1>Shop</h1>
      
      {selectedCharacter ? (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Shopping with: {selectedCharacter.name}</h2>
          <p>Shop Pools: {selectedCharacter.shopPools?.join(', ') || 'None'}</p>
          
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            minWidth: '300px'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🛒 Shop Interface</p>
            <p style={{ color: '#888' }}>Shop functionality coming soon...</p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#ff6b6b' }}>No character data available</p>
        </div>
      )}
      
      <button
        onClick={handleBack}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
      >
        Back to Interaction
      </button>
    </div>
  );
}

export default Shop;
