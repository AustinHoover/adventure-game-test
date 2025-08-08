import React from 'react';
import './Destinations.css';

interface DestinationsProps {
  onDestinationClick?: (destinationName: string) => void;
}

const Destinations: React.FC<DestinationsProps> = ({ onDestinationClick }) => {
  const destinations = [
    { id: 1, name: 'Explore' }
    // Add more destinations here in the future
  ];

  const handleDestinationClick = (destinationName: string) => {
    if (onDestinationClick) {
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
            className="destination-item"
            onClick={() => handleDestinationClick(destination.name)}
          >
            {destination.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
