import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { quizApi, puzzleApi } from '../../services/api';
import Question from './Question';
import ConceptExplain from './ConceptExplain';
import FunPuzzle from './FunPuzzle';
import BoredButton from '../common/BoredButton';
import { useAdaptive } from '../../hooks/useAdaptive';
import './Quiz.css';

function Quiz() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { student, updatePoints } = useStudent();

  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [puzzle, setPuzzle] = useState(null);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState(null);

  const difficultyInfo = useAdaptive(session?.currentDifficulty || 1);

  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    loadSession();
  }, [student, sessionId, navigate]);

  const loadSession = async () => {
    try {
      const data = await quizApi.getStatus(sessionId);
      setSession(data);
      await loadNextQuestion();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    setLoading(true);
    setResult(null);
    setAcknowledged(false);
    setShowPuzzle(false);
    setPuzzle(null);
    setChallengeMessage(null);

    try {
      const data = await quizApi.getNext(sessionId);
      if (data.completed) {
        setCompleted(true);
        setQuestion(null);
      } else {
        setQuestion(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    setLoading(true);
    try {
      const data = await quizApi.submitAnswer(sessionId, question.questionId, answer);
      setResult(data);

      if (data.pointsEarned > 0) {
        updatePoints(data.pointsEarned);
      }

      if (data.difficultyChanged) {
        setSession(prev => ({
          ...prev,
          currentDifficulty: data.newDifficulty
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (text) => {
    if (result?.answerId) {
      try {
        await quizApi.acknowledge(sessionId, result.answerId, text);
      } catch (err) {
        console.error('Failed to acknowledge:', err);
      }
    }
    setAcknowledged(true);
  };

  const handleNextQuestion = () => {
    loadNextQuestion();
  };

  const handleEndQuiz = () => {
    navigate(`/summary/${sessionId}`);
  };

  const handleBoredClick = async () => {
    if (!question?.conceptId) return;

    try {
      const puzzleData = await puzzleApi.getForConcept(question.conceptId);
      setPuzzle(puzzleData);
      setShowPuzzle(true);
    } catch (err) {
      console.error('Failed to load puzzle:', err);
    }
  };

  const handleChallengeClick = async () => {
    try {
      const data = await quizApi.challenge(sessionId);
      setChallengeMessage(data.message);

      if (data.success) {
        setSession(prev => ({
          ...prev,
          currentDifficulty: data.currentDifficulty
        }));
        // Load a new question at the higher difficulty
        setTimeout(() => {
          loadNextQuestion();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to increase difficulty:', err);
    }
  };

  const closePuzzle = () => {
    setShowPuzzle(false);
  };

  if (loading && !question && !completed) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">{error}</div>
        <button className="btn-primary" onClick={() => navigate('/modules')}>
          Back to Modules
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="quiz-container">
        <div className="quiz-completed card text-center">
          <h2>Great Job! 🎉</h2>
          <p>You've answered all available questions for this session.</p>
          <button className="btn-primary mt-3" onClick={handleEndQuiz}>
            View Summary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="session-info">
          <span className="module-name">{session?.module_name}</span>
          <span className={`badge ${difficultyInfo.badgeClass}`}>
            {difficultyInfo.label}
          </span>
        </div>
        <button className="btn-secondary" onClick={handleEndQuiz}>
          End Quiz
        </button>
      </div>

      {challengeMessage && (
        <div className="challenge-message">
          {challengeMessage}
        </div>
      )}

      {question && (
        <Question
          question={question}
          onAnswer={handleAnswer}
          result={result}
          loading={loading}
        />
      )}

      {result && (
        <ConceptExplain
          result={result}
          acknowledged={acknowledged}
          onAcknowledge={handleAcknowledge}
          onNext={handleNextQuestion}
        />
      )}

      {showPuzzle && puzzle && (
        <FunPuzzle puzzle={puzzle} onClose={closePuzzle} />
      )}

      {/* Bottom action buttons */}
      {question && !result && (
        <div className="quiz-actions">
          <button className="challenge-button" onClick={handleChallengeClick}>
            🚀 Challenge Me!
          </button>
          <BoredButton onClick={handleBoredClick} />
        </div>
      )}
    </div>
  );
}

export default Quiz;
