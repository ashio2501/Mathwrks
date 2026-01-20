import React, { useState } from 'react';

function ConceptExplain({ result, acknowledged, onAcknowledge, onNext }) {
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const quickResponses = [
    "Got it!",
    "Makes sense now",
    "I understand",
    "Need more practice"
  ];

  const handleQuickResponse = (text) => {
    onAcknowledge(text);
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      onAcknowledge(customText.trim());
    }
  };

  return (
    <div className="result-section">
      {/* Result Feedback */}
      <div className={`result-feedback ${result.isCorrect ? 'correct' : 'incorrect'}`}>
        <h3>
          {result.isCorrect ? (
            <>✓ Correct! +{result.pointsEarned} points</>
          ) : (
            <>✗ Not quite right</>
          )}
        </h3>
        {!result.isCorrect && (
          <p>The correct answer was: <strong>{result.correctAnswer}</strong></p>
        )}
        {result.explanation && (
          <p className="answer-explanation">{result.explanation}</p>
        )}
      </div>

      {/* Difficulty Change Notice */}
      {result.difficultyChanged && (
        <div className="difficulty-change">
          <span>Difficulty changed to: </span>
          <strong>{result.difficultyLabel}</strong>
        </div>
      )}

      {/* Concept Explanation */}
      <div className="concept-section">
        <h4>💡 Understanding: {result.conceptName}</h4>
        <p>{result.conceptExplanation}</p>
      </div>

      {/* Acknowledgment Section */}
      {!acknowledged ? (
        <div className="acknowledgment-section">
          <h4>How do you feel about this concept?</h4>

          <div className="acknowledgment-buttons">
            {quickResponses.map((text) => (
              <button
                key={text}
                className="btn-outline"
                onClick={() => handleQuickResponse(text)}
              >
                {text}
              </button>
            ))}
          </div>

          {!showCustomInput ? (
            <button
              className="btn-secondary"
              onClick={() => setShowCustomInput(true)}
            >
              Write my own response...
            </button>
          ) : (
            <div className="acknowledgment-input">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Explain what you learned in your own words..."
                rows={3}
              />
              <div className="input-actions mt-2">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCustomInput(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCustomSubmit}
                  disabled={!customText.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="acknowledged-section text-center">
          <p className="text-success">✓ Response recorded</p>
          <button className="btn-primary mt-2" onClick={onNext}>
            Next Question →
          </button>
        </div>
      )}
    </div>
  );
}

export default ConceptExplain;
