import React from 'react';

function PointsDisplay({ points }) {
  return (
    <div className="points-display">
      <span>⭐</span>
      <span>{points} pts</span>
    </div>
  );
}

export default PointsDisplay;
