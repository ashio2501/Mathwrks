// Adaptive difficulty algorithm
// - 3 correct in a row → increase difficulty (max 3)
// - 2 wrong in a row → decrease difficulty (min 1)
// Points multiplier: Easy (1x), Medium (1.5x), Hard (2x)

const BASE_POINTS = 10;

function getPointsMultiplier(difficulty) {
  switch (difficulty) {
    case 1: return 1;
    case 2: return 1.5;
    case 3: return 2;
    default: return 1;
  }
}

function calculatePoints(difficulty) {
  return Math.round(BASE_POINTS * getPointsMultiplier(difficulty));
}

function updateDifficulty(currentDifficulty, correctStreak, wrongStreak, isCorrect) {
  let newDifficulty = currentDifficulty;
  let newCorrectStreak = correctStreak;
  let newWrongStreak = wrongStreak;

  if (isCorrect) {
    newCorrectStreak++;
    newWrongStreak = 0;

    // 3 correct in a row → increase difficulty
    if (newCorrectStreak >= 3 && currentDifficulty < 3) {
      newDifficulty = currentDifficulty + 1;
      newCorrectStreak = 0;
    }
  } else {
    newWrongStreak++;
    newCorrectStreak = 0;

    // 2 wrong in a row → decrease difficulty
    if (newWrongStreak >= 2 && currentDifficulty > 1) {
      newDifficulty = currentDifficulty - 1;
      newWrongStreak = 0;
    }
  }

  return {
    difficulty: newDifficulty,
    correctStreak: newCorrectStreak,
    wrongStreak: newWrongStreak
  };
}

function getDifficultyLabel(difficulty) {
  switch (difficulty) {
    case 1: return 'Easy';
    case 2: return 'Medium';
    case 3: return 'Hard';
    default: return 'Easy';
  }
}

module.exports = {
  calculatePoints,
  updateDifficulty,
  getDifficultyLabel,
  getPointsMultiplier,
  BASE_POINTS
};
