import React from 'react';
import './ButtonGrid.css';

interface ButtonItem {
  callback: (() => void) | null;
  coordinates: { row: number; col: number } | null;
  text: string | null;
  disabled?: boolean; // Optional disabled flag
}

interface ButtonGridProps {
  items: ButtonItem[];
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ items }) => {
  // Create a 6x3 grid of buttons (18 total buttons)
  const buttons = Array.from({ length: 18 }, (_, index) => {
    const row = Math.floor(index / 6);
    const col = index % 6;
    
    // Find the item that matches these coordinates
    const item = items.find(item => 
      item.coordinates && 
      item.coordinates.row === row && 
      item.coordinates.col === col
    );
    
    return {
      index,
      row,
      col,
      item
    };
  });

  const handleButtonClick = (item: ButtonItem | undefined) => {
    if (item && item.callback && !item.disabled) {
      item.callback();
    }
  };

  const isButtonEnabled = (item: ButtonItem | undefined) => {
    return item && item.callback && item.coordinates && item.text && !item.disabled;
  };

  return (
    <div className="button-grid-container">
      <div className="button-grid">
        {buttons.map(({ index, item }) => (
          <button
            key={index}
            className="grid-button"
            disabled={!isButtonEnabled(item)}
            onClick={() => handleButtonClick(item)}
          >
            {item?.text || ''}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ButtonGrid;
