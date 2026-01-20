const API_BASE = '/api';

// Helper function for API calls
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('teacherToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Student API
export const studentApi = {
  getAll: () => fetchApi('/students'),
  create: (name) => fetchApi('/students', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  getById: (id) => fetchApi(`/students/${id}`),
  getProgress: (id) => fetchApi(`/students/${id}/progress`),
};

// Quiz API
export const quizApi = {
  getModules: () => fetchApi('/quiz/modules'),
  start: (studentId, moduleId) => fetchApi('/quiz/start', {
    method: 'POST',
    body: JSON.stringify({ studentId, moduleId }),
  }),
  getNext: (sessionId) => fetchApi(`/quiz/${sessionId}/next`),
  submitAnswer: (sessionId, questionId, answer) => fetchApi(`/quiz/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, answer }),
  }),
  acknowledge: (sessionId, answerId, acknowledgmentText) => fetchApi(`/quiz/${sessionId}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({ answerId, acknowledgmentText }),
  }),
  end: (sessionId) => fetchApi(`/quiz/${sessionId}/end`, {
    method: 'POST',
  }),
  getStatus: (sessionId) => fetchApi(`/quiz/${sessionId}/status`),
};

// Puzzle API
export const puzzleApi = {
  getForConcept: (conceptId) => fetchApi(`/puzzles/concept/${conceptId}`),
  getForModule: (moduleId) => fetchApi(`/puzzles/module/${moduleId}`),
  getAll: () => fetchApi('/puzzles'),
};

// Auth API
export const authApi = {
  login: (username, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  verify: () => fetchApi('/auth/verify'),
};

// Teacher API
export const teacherApi = {
  getStudents: () => fetchApi('/teacher/students'),
  getStudent: (id) => fetchApi(`/teacher/students/${id}`),
  getQuestions: () => fetchApi('/teacher/questions'),
  getConcepts: () => fetchApi('/teacher/concepts'),
  createQuestion: (question) => fetchApi('/teacher/questions', {
    method: 'POST',
    body: JSON.stringify(question),
  }),
  updateQuestion: (id, question) => fetchApi(`/teacher/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(question),
  }),
  deleteQuestion: (id) => fetchApi(`/teacher/questions/${id}`, {
    method: 'DELETE',
  }),
  getPuzzles: () => fetchApi('/teacher/puzzles'),
  createPuzzle: (puzzle) => fetchApi('/teacher/puzzles', {
    method: 'POST',
    body: JSON.stringify(puzzle),
  }),
  deletePuzzle: (id) => fetchApi(`/teacher/puzzles/${id}`, {
    method: 'DELETE',
  }),
};
