import React from 'react';
import './GameClock.css';

interface GameClockProps {
  gameTime: number; // Time in minutes since midnight (0-1439)
}

const GameClock: React.FC<GameClockProps> = ({ gameTime }) => {
  // Convert minutes to hours and minutes
  const hours = Math.floor(gameTime / 60);
  const minutes = gameTime % 60;

  // Calculate clock hand angles
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30; // 30 degrees per hour
  const minuteAngle = minutes * 6; // 6 degrees per minute

  // Determine if it's day or night (6 AM to 6 PM is day)
  const isDay = hours >= 6 && hours < 18;

  return (
    <div className={`game-clock ${isDay ? 'day' : 'night'}`}>
      <div className="clock-container">
        <div className="clock-face">
          {/* Clock numbers */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, index) => (
            <div
              key={num}
              className="clock-number"
              style={{
                transform: `rotate(${index * 30}deg) translateY(-45px)`
              }}
            >
              {num}
            </div>
          ))}

          {/* Hour hand */}
          <div
            className="clock-hand hour-hand"
            style={{
              transform: `rotate(${hourAngle}deg)`
            }}
          />

          {/* Minute hand */}
          <div
            className="clock-hand minute-hand"
            style={{
              transform: `rotate(${minuteAngle}deg)`
            }}
          />

          {/* Center dot */}
          <div className="clock-center" />
        </div>
      </div>
    </div>
  );
};

export default GameClock;
