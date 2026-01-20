const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Get a random puzzle for a concept
router.get('/concept/:conceptId', (req, res) => {
  const { conceptId } = req.params;

  try {
    const puzzle = db.prepare(`
      SELECT p.*, c.name as concept_name
      FROM puzzles p
      JOIN concepts c ON c.id = p.concept_id
      WHERE p.concept_id = ?
      ORDER BY RANDOM()
      LIMIT 1
    `).get(conceptId);

    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle found for this concept' });
    }

    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a random puzzle for a module
router.get('/module/:moduleId', (req, res) => {
  const { moduleId } = req.params;

  try {
    const puzzle = db.prepare(`
      SELECT p.*, c.name as concept_name
      FROM puzzles p
      JOIN concepts c ON c.id = p.concept_id
      WHERE c.module_id = ?
      ORDER BY RANDOM()
      LIMIT 1
    `).get(moduleId);

    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle found for this module' });
    }

    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all puzzles (for browsing)
router.get('/', (req, res) => {
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

module.exports = router;
