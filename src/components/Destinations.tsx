import React from 'react';
import './Destinations.css';

interface DestinationsProps {
  onDestinationClick?: (destinationName: string) => void;
  disabled?: boolean;
}

const Destinations: React.FC<DestinationsProps> = ({ onDestinationClick, disabled = false }) => {
  const destinations = [
    { id: 1, name: 'Explore' }
    // Add more destinations here in the future
  ];

  const handleDestinationClick = (destinationName: string) => {
    if (onDestinationClick && !disabled) {
      onDestinationClick(destinationName);
    }
  };

  return (
    <div className="destinations-container">
      <h2 className="destinations-title">Destinations</h2>
      <div className="destinations-list">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className={`destination-item ${disabled ? 'disabled' : ''}`}
            onClick={() => handleDestinationClick(destination.name)}
            style={{ 
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1 
            }}
          >
            {destination.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
