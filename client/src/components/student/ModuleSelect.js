import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { quizApi } from '../../services/api';
import './ModuleSelect.css';

function ModuleSelect() {
  const navigate = useNavigate();
  const { student } = useStudent();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    loadModules();
  }, [student, navigate]);

  const loadModules = async () => {
    try {
      const data = await quizApi.getModules();
      setModules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModule = async (moduleId) => {
    if (starting) return;
    setStarting(true);
    setError(null);

    try {
      const session = await quizApi.start(student.id, moduleId);
      navigate(`/quiz/${session.sessionId}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="module-select">
      <div className="page-header">
        <h1>Choose a Subject</h1>
        <p>Pick a topic to start learning, {student?.name}!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="module-grid">
        {modules.map((module) => (
          <button
            key={module.id}
            className="module-card"
            onClick={() => handleSelectModule(module.id)}
            disabled={starting}
          >
            <span className="icon">{module.icon}</span>
            <h3>{module.display_name}</h3>
            <p>{module.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModuleSelect;
