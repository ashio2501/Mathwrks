const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { calculatePoints, updateDifficulty, getDifficultyLabel } = require('../utils/adaptiveDifficulty');

// Get modules list
router.get('/modules', (req, res) => {
  try {
    const modules = db.prepare('SELECT id, name, display_name, description, icon FROM modules').all();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a new quiz session
router.post('/start', (req, res) => {
  const { studentId, moduleId } = req.body;

  if (!studentId || !moduleId) {
    return res.status(400).json({ error: 'studentId and moduleId are required' });
  }

  try {
    // Check student exists
    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check module exists
    const module = db.prepare('SELECT id, display_name FROM modules WHERE id = ?').get(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Get or create student module progress
    let progress = db.prepare(
      'SELECT * FROM student_module_progress WHERE student_id = ? AND module_id = ?'
    ).get(studentId, moduleId);

    if (!progress) {
      db.prepare(
        'INSERT INTO student_module_progress (student_id, module_id) VALUES (?, ?)'
      ).run(studentId, moduleId);
      progress = { current_difficulty: 1, correct_streak: 0, wrong_streak: 0 };
    }

    // Create quiz session
    const result = db.prepare(
      'INSERT INTO quiz_sessions (student_id, module_id) VALUES (?, ?)'
    ).run(studentId, moduleId);

    res.json({
      sessionId: result.lastInsertRowid,
      moduleId,
      moduleName: module.display_name,
      currentDifficulty: progress.current_difficulty,
      difficultyLabel: getDifficultyLabel(progress.current_difficulty)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next question for a session
router.get('/:sessionId/next', (req, res) => {
  const { sessionId } = req.params;

  try {
    // Get session info
    const session = db.prepare(`
      SELECT qs.*, s.id as student_id
      FROM quiz_sessions qs
      JOIN students s ON s.id = qs.student_id
      WHERE qs.id = ?
    `).get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.ended_at) {
      return res.status(400).json({ error: 'Session has ended' });
    }

    // Get student's current progress for this module
    const progress = db.prepare(
      'SELECT * FROM student_module_progress WHERE student_id = ? AND module_id = ?'
    ).get(session.student_id, session.module_id);

    const difficulty = progress?.current_difficulty || 1;

    // Get questions already answered in this session
    const answeredQuestionIds = db.prepare(
      'SELECT question_id FROM answers WHERE session_id = ?'
    ).all(sessionId).map(a => a.question_id);

    // Get concepts for this module
    const concepts = db.prepare(
      'SELECT id FROM concepts WHERE module_id = ?'
    ).all(session.module_id).map(c => c.id);

    // Build query to get a random question at current difficulty
    let query = `
      SELECT q.*, c.name as concept_name
      FROM questions q
      JOIN concepts c ON c.id = q.concept_id
      WHERE q.concept_id IN (${concepts.join(',')})
      AND q.difficulty = ?
    `;

    if (answeredQuestionIds.length > 0) {
      query += ` AND q.id NOT IN (${answeredQuestionIds.join(',')})`;
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    let question = db.prepare(query).get(difficulty);

    // If no question at current difficulty, try other difficulties
    if (!question) {
      query = `
        SELECT q.*, c.name as concept_name
        FROM questions q
        JOIN concepts c ON c.id = q.concept_id
        WHERE q.concept_id IN (${concepts.join(',')})
      `;
      if (answeredQuestionIds.length > 0) {
        query += ` AND q.id NOT IN (${answeredQuestionIds.join(',')})`;
      }
      query += ' ORDER BY RANDOM() LIMIT 1';
      question = db.prepare(query).get();
    }

    if (!question) {
      return res.json({
        completed: true,
        message: 'No more questions available'
      });
    }

    res.json({
      questionId: question.id,
      conceptId: question.concept_id,
      conceptName: question.concept_name,
      difficulty: question.difficulty,
      difficultyLabel: getDifficultyLabel(question.difficulty),
      questionText: question.question_text,
      options: {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d
      },
      potentialPoints: calculatePoints(question.difficulty),
      questionNumber: answeredQuestionIds.length + 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit an answer
router.post('/:sessionId/answer', (req, res) => {
  const { sessionId } = req.params;
  const { questionId, answer } = req.body;

  if (!questionId || !answer) {
    return res.status(400).json({ error: 'questionId and answer are required' });
  }

  if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
    return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
  }

  try {
    // Get session
    const session = db.prepare('SELECT * FROM quiz_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.ended_at) {
      return res.status(400).json({ error: 'Session has ended' });
    }

    // Get question
    const question = db.prepare(`
      SELECT q.*, c.explanation as concept_explanation, c.name as concept_name
      FROM questions q
      JOIN concepts c ON c.id = q.concept_id
      WHERE q.id = ?
    `).get(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if already answered
    const existingAnswer = db.prepare(
      'SELECT id FROM answers WHERE session_id = ? AND question_id = ?'
    ).get(sessionId, questionId);

    if (existingAnswer) {
      return res.status(400).json({ error: 'Question already answered' });
    }

    // Check answer
    const isCorrect = answer.toUpperCase() === question.correct_answer;
    const pointsEarned = isCorrect ? calculatePoints(question.difficulty) : 0;

    // Save answer
    db.prepare(`
      INSERT INTO answers (session_id, question_id, student_answer, is_correct, points_earned)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, questionId, answer.toUpperCase(), isCorrect ? 1 : 0, pointsEarned);

    // Update session stats
    db.prepare(`
      UPDATE quiz_sessions
      SET total_questions = total_questions + 1,
          correct_answers = correct_answers + ?,
          points_earned = points_earned + ?
      WHERE id = ?
    `).run(isCorrect ? 1 : 0, pointsEarned, sessionId);

    // Update student total points
    if (pointsEarned > 0) {
      db.prepare('UPDATE students SET total_points = total_points + ? WHERE id = ?')
        .run(pointsEarned, session.student_id);
    }

    // Get current progress
    const progress = db.prepare(
      'SELECT * FROM student_module_progress WHERE student_id = ? AND module_id = ?'
    ).get(session.student_id, session.module_id);

    // Update adaptive difficulty
    const newProgress = updateDifficulty(
      progress.current_difficulty,
      progress.correct_streak,
      progress.wrong_streak,
      isCorrect
    );

    db.prepare(`
      UPDATE student_module_progress
      SET current_difficulty = ?, correct_streak = ?, wrong_streak = ?
      WHERE student_id = ? AND module_id = ?
    `).run(
      newProgress.difficulty,
      newProgress.correctStreak,
      newProgress.wrongStreak,
      session.student_id,
      session.module_id
    );

    // Get the last answer ID for acknowledgment
    const lastAnswer = db.prepare(
      'SELECT id FROM answers WHERE session_id = ? AND question_id = ?'
    ).get(sessionId, questionId);

    res.json({
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      conceptName: question.concept_name,
      conceptExplanation: question.concept_explanation,
      pointsEarned,
      newDifficulty: newProgress.difficulty,
      difficultyLabel: getDifficultyLabel(newProgress.difficulty),
      difficultyChanged: newProgress.difficulty !== progress.current_difficulty,
      answerId: lastAnswer.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge concept understanding
router.post('/:sessionId/acknowledge', (req, res) => {
  const { sessionId } = req.params;
  const { answerId, acknowledgmentText } = req.body;

  if (!answerId) {
    return res.status(400).json({ error: 'answerId is required' });
  }

  try {
    // Verify the answer belongs to this session
    const answer = db.prepare(
      'SELECT * FROM answers WHERE id = ? AND session_id = ?'
    ).get(answerId, sessionId);

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found in this session' });
    }

    // Update acknowledgment
    db.prepare(`
      UPDATE answers
      SET acknowledged = 1, acknowledgment_text = ?
      WHERE id = ?
    `).run(acknowledgmentText || null, answerId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End quiz session
router.post('/:sessionId/end', (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = db.prepare('SELECT * FROM quiz_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.ended_at) {
      return res.status(400).json({ error: 'Session already ended' });
    }

    db.prepare('UPDATE quiz_sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(sessionId);

    // Get summary
    const summary = db.prepare(`
      SELECT
        qs.*,
        s.name as student_name,
        s.total_points as student_total_points,
        m.display_name as module_name
      FROM quiz_sessions qs
      JOIN students s ON s.id = qs.student_id
      JOIN modules m ON m.id = qs.module_id
      WHERE qs.id = ?
    `).get(sessionId);

    // Get answer details
    const answers = db.prepare(`
      SELECT
        a.*,
        q.question_text,
        q.correct_answer,
        c.name as concept_name
      FROM answers a
      JOIN questions q ON q.id = a.question_id
      JOIN concepts c ON c.id = q.concept_id
      WHERE a.session_id = ?
      ORDER BY a.answered_at
    `).all(sessionId);

    res.json({
      ...summary,
      answers,
      accuracy: summary.total_questions > 0
        ? Math.round((summary.correct_answers / summary.total_questions) * 100)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session status
router.get('/:sessionId/status', (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = db.prepare(`
      SELECT
        qs.*,
        s.name as student_name,
        s.total_points as student_total_points,
        m.display_name as module_name
      FROM quiz_sessions qs
      JOIN students s ON s.id = qs.student_id
      JOIN modules m ON m.id = qs.module_id
      WHERE qs.id = ?
    `).get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const progress = db.prepare(
      'SELECT * FROM student_module_progress WHERE student_id = ? AND module_id = ?'
    ).get(session.student_id, session.module_id);

    res.json({
      ...session,
      currentDifficulty: progress?.current_difficulty || 1,
      difficultyLabel: getDifficultyLabel(progress?.current_difficulty || 1)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
