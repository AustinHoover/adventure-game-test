import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Journey() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/explore');
  };

  return (
    <div className="Landing">
      <div className="landing-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '2rem'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '2.5rem', 
            margin: 0,
            textAlign: 'center'
          }}>
            Journey
          </h1>
          
          <button
            onClick={handleBack}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Journey;
