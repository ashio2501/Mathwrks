import React, { useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';

function Question({ question, onAnswer, result, loading }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const difficultyInfo = useAdaptive(question.difficulty);

  const handleOptionClick = (letter) => {
    if (result || loading) return;
    setSelectedAnswer(letter);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || loading) return;
    onAnswer(selectedAnswer);
  };

  const getOptionClass = (letter) => {
    let classes = 'option-button';

    if (selectedAnswer === letter) {
      classes += ' selected';
    }

    if (result) {
      if (letter === result.correctAnswer) {
        classes += ' correct';
      } else if (selectedAnswer === letter && !result.isCorrect) {
        classes += ' incorrect';
      }
    }

    return classes;
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">
          Question {question.questionNumber}
        </span>
        <div className="question-meta">
          <span className={`badge ${difficultyInfo.badgeClass}`}>
            {difficultyInfo.label}
          </span>
          <span className="potential-points">
            +{question.potentialPoints} pts
          </span>
        </div>
      </div>

      <div className="question-concept">
        <span className="badge badge-primary">{question.conceptName}</span>
      </div>

      <p className="question-text">{question.questionText}</p>

      <div className="options-list">
        {Object.entries(question.options).map(([letter, text]) => (
          <button
            key={letter}
            className={getOptionClass(letter)}
            onClick={() => handleOptionClick(letter)}
            disabled={!!result || loading}
          >
            <span className="option-letter">{letter}</span>
            <span className="option-text">{text}</span>
          </button>
        ))}
      </div>

      {!result && (
        <button
          className="btn-primary submit-btn"
          onClick={handleSubmit}
          disabled={!selectedAnswer || loading}
        >
          {loading ? 'Checking...' : 'Submit Answer'}
        </button>
      )}
    </div>
  );
}

export default Question;
