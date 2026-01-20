const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Get all students
router.get('/', (req, res) => {
  try {
    const students = db.prepare('SELECT id, name, total_points FROM students ORDER BY name').all();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new student
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const existing = db.prepare('SELECT id FROM students WHERE name = ?').get(name.trim());
    if (existing) {
      return res.status(400).json({ error: 'Student name already exists' });
    }

    const result = db.prepare('INSERT INTO students (name) VALUES (?)').run(name.trim());
    const student = db.prepare('SELECT id, name, total_points FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', (req, res) => {
  try {
    const student = db.prepare('SELECT id, name, total_points FROM students WHERE id = ?').get(req.params.id);
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
    const student = db.prepare('SELECT id, name, total_points FROM students WHERE id = ?').get(req.params.id);
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

// Get all modules
router.get('/modules/list', (req, res) => {
  try {
    const modules = db.prepare('SELECT id, name, display_name, description, icon FROM modules').all();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
