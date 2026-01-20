const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { teacherAuth } = require('../middleware/teacherAuth');

// All routes require teacher authentication
router.use(teacherAuth);

// Get all students with their progress
router.get('/students', (req, res) => {
  try {
    const students = db.prepare(`
      SELECT
        s.*,
        (SELECT COUNT(*) FROM quiz_sessions WHERE student_id = s.id) as total_quizzes,
        (SELECT SUM(correct_answers) FROM quiz_sessions WHERE student_id = s.id) as total_correct,
        (SELECT SUM(total_questions) FROM quiz_sessions WHERE student_id = s.id) as total_answered
      FROM students s
      ORDER BY s.name
    `).all();

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed student progress
router.get('/students/:id', (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const moduleProgress = db.prepare(`
      SELECT
        m.display_name as module_name,
        smp.current_difficulty,
        smp.correct_streak,
        smp.wrong_streak,
        (SELECT COUNT(*) FROM quiz_sessions WHERE student_id = ? AND module_id = m.id) as quizzes_taken,
        (SELECT SUM(points_earned) FROM quiz_sessions WHERE student_id = ? AND module_id = m.id) as points_earned
      FROM modules m
      LEFT JOIN student_module_progress smp ON smp.module_id = m.id AND smp.student_id = ?
    `).all(req.params.id, req.params.id, req.params.id);

    const recentQuizzes = db.prepare(`
      SELECT
        qs.*,
        m.display_name as module_name
      FROM quiz_sessions qs
      JOIN modules m ON m.id = qs.module_id
      WHERE qs.student_id = ?
      ORDER BY qs.started_at DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({
      ...student,
      moduleProgress,
      recentQuizzes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all questions
router.get('/questions', (req, res) => {
  try {
    const questions = db.prepare(`
      SELECT
        q.*,
        c.name as concept_name,
        m.display_name as module_name
      FROM questions q
      JOIN concepts c ON c.id = q.concept_id
      JOIN modules m ON m.id = c.module_id
      ORDER BY m.id, c.id, q.difficulty
    `).all();

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get concepts for dropdown
router.get('/concepts', (req, res) => {
  try {
    const concepts = db.prepare(`
      SELECT c.*, m.display_name as module_name
      FROM concepts c
      JOIN modules m ON m.id = c.module_id
      ORDER BY m.id, c.id
    `).all();

    res.json(concepts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a question
router.post('/questions', (req, res) => {
  const {
    concept_id,
    difficulty,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation
  } = req.body;

  if (!concept_id || !difficulty || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (difficulty < 1 || difficulty > 3) {
    return res.status(400).json({ error: 'Difficulty must be 1, 2, or 3' });
  }

  if (!['A', 'B', 'C', 'D'].includes(correct_answer.toUpperCase())) {
    return res.status(400).json({ error: 'Correct answer must be A, B, C, or D' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO questions (concept_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(concept_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer.toUpperCase(), explanation || null);

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a question
router.put('/questions/:id', (req, res) => {
  const {
    concept_id,
    difficulty,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation
  } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    db.prepare(`
      UPDATE questions
      SET concept_id = ?, difficulty = ?, question_text = ?,
          option_a = ?, option_b = ?, option_c = ?, option_d = ?,
          correct_answer = ?, explanation = ?
      WHERE id = ?
    `).run(
      concept_id || existing.concept_id,
      difficulty || existing.difficulty,
      question_text || existing.question_text,
      option_a || existing.option_a,
      option_b || existing.option_b,
      option_c || existing.option_c,
      option_d || existing.option_d,
      (correct_answer || existing.correct_answer).toUpperCase(),
      explanation !== undefined ? explanation : existing.explanation,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a question
router.delete('/questions/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if question has been used in any answers
    const usedInAnswers = db.prepare('SELECT COUNT(*) as count FROM answers WHERE question_id = ?').get(req.params.id);
    if (usedInAnswers.count > 0) {
      return res.status(400).json({ error: 'Cannot delete question that has been answered by students' });
    }

    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all puzzles
router.get('/puzzles', (req, res) => {
  try {
    const puzzles = db.prepare(`
      SELECT p.*, c.name as concept_name, m.display_name as module_name
      FROM puzzles p
      JOIN concepts c ON c.id = p.concept_id
      JOIN modules m ON m.id = c.module_id
      ORDER BY m.id, c.id
    `).all();

    res.json(puzzles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a puzzle
router.post('/puzzles', (req, res) => {
  const { concept_id, title, puzzle_text, hint, solution } = req.body;

  if (!concept_id || !title || !puzzle_text) {
    return res.status(400).json({ error: 'concept_id, title, and puzzle_text are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO puzzles (concept_id, title, puzzle_text, hint, solution)
      VALUES (?, ?, ?, ?, ?)
    `).run(concept_id, title, puzzle_text, hint || null, solution || null);

    const puzzle = db.prepare('SELECT * FROM puzzles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(puzzle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a puzzle
router.delete('/puzzles/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM puzzles WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    db.prepare('DELETE FROM puzzles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
