import React from 'react';

function BoredButton({ onClick }) {
  return (
    <button className="bored-button" onClick={onClick}>
      I'm Bored! 🎯
    </button>
  );
}

export default BoredButton;
