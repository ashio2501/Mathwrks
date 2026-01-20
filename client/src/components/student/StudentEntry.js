import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { studentApi } from '../../services/api';
import './StudentEntry.css';

function StudentEntry() {
  const navigate = useNavigate();
  const { student, selectStudent, createStudent, loading: studentLoading } = useStudent();
  const [students, setStudents] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (student) {
      navigate('/modules');
    }
  }, [student, navigate]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentApi.getAll();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (selectedStudent) => {
    selectStudent(selectedStudent);
    navigate('/modules');
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setError(null);
    try {
      await createStudent(newName.trim());
      navigate('/modules');
    } catch (err) {
      setError(err.message);
    }
  };

  if (studentLoading || loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="student-entry">
      <div className="page-header">
        <h1>Welcome to MathWrks!</h1>
        <p>Select your name or create a new account to start learning</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!showNewForm ? (
        <>
          {students.length > 0 && (
            <div className="student-list">
              <h3>Choose Your Name</h3>
              <div className="student-grid">
                {students.map((s) => (
                  <button
                    key={s.id}
                    className="student-card"
                    onClick={() => handleSelectStudent(s)}
                  >
                    <span className="student-avatar">
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="student-info">
                      <span className="student-name">{s.name}</span>
                      <span className="student-points">⭐ {s.total_points} pts</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="new-student-section">
            <button
              className="btn-primary new-student-btn"
              onClick={() => setShowNewForm(true)}
            >
              + I'm New Here
            </button>
          </div>
        </>
      ) : (
        <div className="new-student-form card">
          <h3>Create Your Account</h3>
          <form onSubmit={handleCreateStudent}>
            <div className="form-group">
              <label htmlFor="name">What's your name?</label>
              <input
                id="name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name..."
                autoFocus
              />
            </div>
            <div className="form-buttons">
              <button type="button" className="btn-secondary" onClick={() => setShowNewForm(false)}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={!newName.trim()}>
                Start Learning!
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudentEntry;
