import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teacherApi } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/teacher');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
    }
  }, [isAuthenticated]);

  const loadStudents = async () => {
    try {
      const data = await teacherApi.getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (studentId) => {
    if (selectedStudent === studentId) {
      setSelectedStudent(null);
      setStudentDetails(null);
      return;
    }

    setSelectedStudent(studentId);
    try {
      const details = await teacherApi.getStudent(studentId);
      setStudentDetails(details);
    } catch (err) {
      console.error('Failed to load student details:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="teacher-container">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>View student progress and manage content</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-section">
        <h2>Student Progress</h2>

        {students.length === 0 ? (
          <p className="text-secondary">No students yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Points</th>
                <th>Quizzes Taken</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <React.Fragment key={student.id}>
                  <tr
                    className={`clickable-row ${selectedStudent === student.id ? 'selected' : ''}`}
                    onClick={() => handleStudentClick(student.id)}
                  >
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>⭐ {student.total_points}</td>
                    <td>{student.total_quizzes || 0}</td>
                    <td>
                      {student.total_answered > 0
                        ? `${Math.round((student.total_correct / student.total_answered) * 100)}%`
                        : '-'}
                    </td>
                  </tr>
                  {selectedStudent === student.id && studentDetails && (
                    <tr className="details-row">
                      <td colSpan="4">
                        <div className="student-details">
                          <h4>Module Progress</h4>
                          <div className="module-progress-list">
                            {studentDetails.moduleProgress.map((mp, idx) => (
                              <div key={idx} className="module-progress-item">
                                <span className="module-name">{mp.module_name}</span>
                                <span className={`badge badge-${getDifficultyClass(mp.current_difficulty)}`}>
                                  Level {mp.current_difficulty || 1}
                                </span>
                                <span className="quiz-count">
                                  {mp.quizzes_taken || 0} quizzes
                                </span>
                                <span className="points">
                                  {mp.points_earned || 0} pts
                                </span>
                              </div>
                            ))}
                          </div>

                          {studentDetails.recentQuizzes.length > 0 && (
                            <>
                              <h4>Recent Quizzes</h4>
                              <div className="recent-quizzes">
                                {studentDetails.recentQuizzes.map((quiz) => (
                                  <div key={quiz.id} className="quiz-item">
                                    <span>{quiz.module_name}</span>
                                    <span>
                                      {quiz.correct_answers}/{quiz.total_questions} correct
                                    </span>
                                    <span>+{quiz.points_earned} pts</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getDifficultyClass(difficulty) {
  switch (difficulty) {
    case 1: return 'easy';
    case 2: return 'medium';
    case 3: return 'hard';
    default: return 'easy';
  }
}

export default Dashboard;
