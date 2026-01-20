const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/database');

const JWT_SECRET = process.env.JWT_SECRET || 'mathwrks-student-secret-2024';

// Student registration
router.post('/register', (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = db.prepare('SELECT id FROM students WHERE username = ?').get(username.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO students (username, password_hash, name) VALUES (?, ?, ?)'
    ).run(username.toLowerCase(), passwordHash, name.trim());

    const student = db.prepare(
      'SELECT id, username, name, total_points FROM students WHERE id = ?'
    ).get(result.lastInsertRowid);

    const token = jwt.sign(
      { id: student.id, username: student.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      student: {
        id: student.id,
        username: student.username,
        name: student.name,
        total_points: student.total_points
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const student = db.prepare(
      'SELECT * FROM students WHERE username = ?'
    ).get(username.toLowerCase());

    if (!student) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const validPassword = bcrypt.compareSync(password, student.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: student.id, username: student.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      student: {
        id: student.id,
        username: student.username,
        name: student.name,
        total_points: student.total_points
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token and get current student
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const student = db.prepare(
      'SELECT id, username, name, total_points FROM students WHERE id = ?'
    ).get(decoded.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Get student by ID
router.get('/:id', (req, res) => {
  try {
    const student = db.prepare(
      'SELECT id, username, name, total_points FROM students WHERE id = ?'
    ).get(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student progress with module breakdown
router.get('/:id/progress', (req, res) => {
  try {
    const student = db.prepare(
      'SELECT id, username, name, total_points FROM students WHERE id = ?'
    ).get(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get module progress
    const moduleProgress = db.prepare(`
      SELECT
        m.id as module_id,
        m.display_name as module_name,
        COALESCE(smp.current_difficulty, 1) as current_difficulty,
        COALESCE(smp.correct_streak, 0) as correct_streak,
        COALESCE(smp.wrong_streak, 0) as wrong_streak
      FROM modules m
      LEFT JOIN student_module_progress smp ON smp.module_id = m.id AND smp.student_id = ?
    `).all(req.params.id);

    // Get quiz history
    const quizHistory = db.prepare(`
      SELECT
        qs.id as session_id,
        m.display_name as module_name,
        qs.total_questions,
        qs.correct_answers,
        qs.points_earned,
        qs.started_at,
        qs.ended_at
      FROM quiz_sessions qs
      JOIN modules m ON m.id = qs.module_id
      WHERE qs.student_id = ?
      ORDER BY qs.started_at DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({
      ...student,
      moduleProgress,
      quizHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
