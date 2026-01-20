import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { quizApi } from '../../services/api';
import './QuizSummary.css';

function QuizSummary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { student, refreshStudent } = useStudent();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    loadSummary();
  }, [student, sessionId, navigate]);

  const loadSummary = async () => {
    try {
      const data = await quizApi.end(sessionId);
      setSummary(data);
      refreshStudent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGradeEmoji = () => {
    if (!summary) return '';
    const accuracy = summary.accuracy;
    if (accuracy >= 90) return '🌟';
    if (accuracy >= 70) return '👏';
    if (accuracy >= 50) return '👍';
    return '💪';
  };

  const getGradeMessage = () => {
    if (!summary) return '';
    const accuracy = summary.accuracy;
    if (accuracy >= 90) return 'Outstanding!';
    if (accuracy >= 70) return 'Great job!';
    if (accuracy >= 50) return 'Good effort!';
    return 'Keep practicing!';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-container">
        <div className="error-message">{error}</div>
        <button className="btn-primary" onClick={() => navigate('/modules')}>
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="summary-container">
      <div className="summary-card">
        <div className="summary-header">
          <span className="grade-emoji">{getGradeEmoji()}</span>
          <h1>{getGradeMessage()}</h1>
          <p className="module-name">{summary.module_name}</p>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-value">{summary.correct_answers}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summary.total_questions}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summary.accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>

        <div className="points-earned">
          <span className="points-icon">⭐</span>
          <span className="points-text">+{summary.points_earned} points earned!</span>
        </div>

        <div className="total-points">
          Total Points: <strong>{summary.student_total_points}</strong>
        </div>

        {summary.answers && summary.answers.length > 0 && (
          <div className="answers-review">
            <h3>Question Review</h3>
            <div className="answers-list">
              {summary.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={`answer-item ${answer.is_correct ? 'correct' : 'incorrect'}`}
                >
                  <div className="answer-number">Q{index + 1}</div>
                  <div className="answer-details">
                    <p className="answer-question">{answer.question_text}</p>
                    <p className="answer-info">
                      Your answer: <strong>{answer.student_answer}</strong>
                      {!answer.is_correct && (
                        <> (Correct: <strong>{answer.correct_answer}</strong>)</>
                      )}
                    </p>
                  </div>
                  <div className="answer-status">
                    {answer.is_correct ? '✓' : '✗'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="summary-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/modules')}
          >
            Practice Another Topic
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizSummary;
