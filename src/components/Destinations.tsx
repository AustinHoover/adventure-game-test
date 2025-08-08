import React from 'react';
import { TicketSystem } from '../utils/ticketSystem';
import './Destinations.css';

interface DestinationsProps {
  // Add props here if needed in the future
}

const Destinations: React.FC<DestinationsProps> = () => {
  const destinations = [
    { id: 1, name: 'Explore' }
    // Add more destinations here in the future
  ];

  // Create ticket system for explore actions
  const exploreTicketSystem = new TicketSystem<() => void>();
  
  // Add tickets for different explore actions
  exploreTicketSystem.addOption(() => {
    console.log('test');
  }, 2); // 2 tickets for logging "test"
  
  exploreTicketSystem.addOption(() => {
    setTimeout(() => {
      console.log('1 second timeout completed');
    }, 1000);
  }, 1); // 1 ticket for 1 second timeout

  const handleDestinationClick = (destinationName: string) => {
    if (destinationName === 'Explore') {
      const selectedAction = exploreTicketSystem.selectRandom();
      if (selectedAction) {
        selectedAction();
      }
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
