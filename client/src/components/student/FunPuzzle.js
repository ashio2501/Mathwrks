import React, { useState } from 'react';

function FunPuzzle({ puzzle, onClose }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="puzzle-overlay">
      <div className="puzzle-modal">
        <div className="puzzle-header">
          <h2>🎯 Brain Teaser</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="puzzle-content">
          <h3>{puzzle.title}</h3>
          <p className="puzzle-text">{puzzle.puzzle_text}</p>

          <div className="puzzle-concept">
            <span className="badge badge-primary">{puzzle.concept_name}</span>
          </div>

          {!showHint && puzzle.hint && (
            <button
              className="btn-outline hint-btn"
              onClick={() => setShowHint(true)}
            >
              Need a hint? 💡
            </button>
          )}

          {showHint && puzzle.hint && (
            <div className="puzzle-hint">
              <h5>💡 Hint</h5>
              <p>{puzzle.hint}</p>
            </div>
          )}

          {!showSolution && puzzle.solution && (
            <button
              className="btn-secondary solution-btn"
              onClick={() => setShowSolution(true)}
            >
              Show Solution
            </button>
          )}

          {showSolution && puzzle.solution && (
            <div className="puzzle-solution">
              <h5>✓ Solution</h5>
              <p>{puzzle.solution}</p>
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button className="btn-primary" onClick={onClose}>
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default FunPuzzle;
