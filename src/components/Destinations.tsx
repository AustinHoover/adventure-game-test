import React from 'react';
import './Destinations.css';

interface DestinationsProps {
  // Add props here if needed in the future
}

const Destinations: React.FC<DestinationsProps> = () => {
  const destinations = [
    { id: 1, name: 'Explore' }
    // Add more destinations here in the future
  ];

  const handleDestinationClick = (destinationName: string) => {
    if (destinationName === 'Explore') {
      console.log('test');
    }
    // Add more destination handling logic here in the future
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
