import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teacherApi } from '../../services/api';
import './QuestionEditor.css';

function QuestionEditor() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [puzzles, setPuzzles] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    concept_id: '',
    difficulty: 1,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/teacher');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [questionsData, puzzlesData, conceptsData] = await Promise.all([
        teacherApi.getQuestions(),
        teacherApi.getPuzzles(),
        teacherApi.getConcepts()
      ]);
      setQuestions(questionsData);
      setPuzzles(puzzlesData);
      setConcepts(conceptsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      concept_id: concepts[0]?.id || '',
      difficulty: 1,
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: ''
    });
    setEditingQuestion(null);
  };

  const handleAddNew = () => {
    resetForm();
    setFormData(prev => ({ ...prev, concept_id: concepts[0]?.id || '' }));
    setShowForm(true);
  };

  const handleEdit = (question) => {
    setFormData({
      concept_id: question.concept_id,
      difficulty: question.difficulty,
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      explanation: question.explanation || ''
    });
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await teacherApi.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingQuestion) {
        const updated = await teacherApi.updateQuestion(editingQuestion.id, formData);
        setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...q, ...updated } : q));
      } else {
        const newQuestion = await teacherApi.createQuestion(formData);
        setQuestions([...questions, newQuestion]);
      }
      setShowForm(false);
      resetForm();
      loadData(); // Reload to get full data with joins
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulty' || name === 'concept_id' ? Number(value) : value
    }));
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
        <h1>Content Management</h1>
        <p>Add, edit, and manage questions and puzzles</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="teacher-tabs">
        <button
          className={`teacher-tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions ({questions.length})
        </button>
        <button
          className={`teacher-tab ${activeTab === 'puzzles' ? 'active' : ''}`}
          onClick={() => setActiveTab('puzzles')}
        >
          Puzzles ({puzzles.length})
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="content-section">
          <div className="section-header">
            <h2>Questions</h2>
            <button className="btn-primary" onClick={handleAddNew}>
              + Add Question
            </button>
          </div>

          {showForm && (
            <div className="question-form card">
              <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Concept</label>
                    <select name="concept_id" value={formData.concept_id} onChange={handleChange} required>
                      {concepts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.module_name} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                      <option value={1}>Easy</option>
                      <option value={2}>Medium</option>
                      <option value={3}>Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    name="question_text"
                    value={formData.question_text}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Option A</label>
                    <input
                      type="text"
                      name="option_a"
                      value={formData.option_a}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Option B</label>
                    <input
                      type="text"
                      name="option_b"
                      value={formData.option_b}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Option C</label>
                    <input
                      type="text"
                      name="option_c"
                      value={formData.option_c}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Option D</label>
                    <input
                      type="text"
                      name="option_d"
                      value={formData.option_d}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Correct Answer</label>
                    <select name="correct_answer" value={formData.correct_answer} onChange={handleChange}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Explanation (shown after answering)</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>

                <div className="form-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingQuestion ? 'Update' : 'Create'} Question
                  </button>
                </div>
              </form>
            </div>
          )}

          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Concept</th>
                <th>Question</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.module_name}</td>
                  <td>{q.concept_name}</td>
                  <td className="question-preview">{q.question_text}</td>
                  <td>
                    <span className={`badge badge-${getDifficultyClass(q.difficulty)}`}>
                      {getDifficultyLabel(q.difficulty)}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="btn-sm btn-secondary" onClick={() => handleEdit(q)}>
                      Edit
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(q.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'puzzles' && (
        <div className="content-section">
          <h2>Puzzles</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Concept</th>
                <th>Title</th>
                <th>Puzzle</th>
              </tr>
            </thead>
            <tbody>
              {puzzles.map((p) => (
                <tr key={p.id}>
                  <td>{p.module_name}</td>
                  <td>{p.concept_name}</td>
                  <td>{p.title}</td>
                  <td className="question-preview">{p.puzzle_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

function getDifficultyLabel(difficulty) {
  switch (difficulty) {
    case 1: return 'Easy';
    case 2: return 'Medium';
    case 3: return 'Hard';
    default: return 'Easy';
  }
}

export default QuestionEditor;
