const express = require('express');
const cors = require('cors');
const path = require('path');

const studentRoutes = require('./routes/students');
const quizRoutes = require('./routes/quiz');
const puzzleRoutes = require('./routes/puzzles');
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MathWrks API is running' });
});

app.listen(PORT, () => {
  console.log(`MathWrks server running on port ${PORT}`);
});
