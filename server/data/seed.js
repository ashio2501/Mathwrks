const bcrypt = require('bcryptjs');
const db = require('./database');

// Clear existing data (in reverse order of dependencies)
db.exec(`
  DELETE FROM answers;
  DELETE FROM quiz_sessions;
  DELETE FROM student_module_progress;
  DELETE FROM puzzles;
  DELETE FROM questions;
  DELETE FROM concepts;
  DELETE FROM modules;
  DELETE FROM teachers;
  DELETE FROM students;
`);

// Seed modules
const insertModule = db.prepare('INSERT INTO modules (name, display_name, description, icon) VALUES (?, ?, ?, ?)');
insertModule.run('algebra', 'Algebra', 'Learn about equations, variables, and expressions', '🔢');
insertModule.run('geometry', 'Geometry', 'Explore shapes, angles, and spatial relationships', '📐');
insertModule.run('number_theory', 'Number Theory', 'Discover the fascinating world of numbers', '🔣');

// Seed concepts
const insertConcept = db.prepare('INSERT INTO concepts (module_id, name, explanation) VALUES (?, ?, ?)');

// Algebra concepts
insertConcept.run(1, 'Variables', 'A variable is a letter (like x or y) that represents an unknown number. Think of it as a box that can hold any number. For example, if x = 5, then x + 2 = 7.');
insertConcept.run(1, 'Expressions', 'An expression is a combination of numbers, variables, and operations (like + - × ÷). For example, 3x + 2 is an expression where we multiply x by 3 and then add 2.');
insertConcept.run(1, 'Equations', 'An equation is like a balance scale - both sides must be equal. When we have x + 5 = 10, we need to find what value of x makes both sides equal (x = 5).');
insertConcept.run(1, 'Order of Operations', 'PEMDAS helps us solve expressions in the right order: Parentheses, Exponents, Multiplication/Division (left to right), Addition/Subtraction (left to right).');

// Geometry concepts
insertConcept.run(2, 'Angles', 'An angle is formed when two lines meet at a point. We measure angles in degrees. A right angle is 90°, a straight angle is 180°, and a full rotation is 360°.');
insertConcept.run(2, 'Triangles', 'A triangle has 3 sides and 3 angles that always add up to 180°. There are different types: equilateral (all sides equal), isosceles (two sides equal), and scalene (no sides equal).');
insertConcept.run(2, 'Area and Perimeter', 'Perimeter is the distance around a shape (add all sides). Area is the space inside a shape. For a rectangle: Perimeter = 2(length + width), Area = length × width.');
insertConcept.run(2, 'Circles', 'A circle has a center point, radius (distance from center to edge), and diameter (distance across through center = 2 × radius). Circumference = π × diameter.');

// Number Theory concepts
insertConcept.run(3, 'Prime Numbers', 'A prime number can only be divided evenly by 1 and itself. Examples: 2, 3, 5, 7, 11, 13. The number 1 is not prime. The number 2 is the only even prime!');
insertConcept.run(3, 'Factors', 'Factors are numbers that divide evenly into another number. The factors of 12 are: 1, 2, 3, 4, 6, and 12. Finding factors helps us simplify fractions!');
insertConcept.run(3, 'Multiples', 'Multiples are what you get when you multiply a number by 1, 2, 3, etc. Multiples of 5 are: 5, 10, 15, 20, 25... The LCM is the smallest number that is a multiple of two numbers.');
insertConcept.run(3, 'Divisibility Rules', 'Quick tricks to check if a number divides evenly: Divisible by 2 if even, by 3 if digits sum to multiple of 3, by 5 if ends in 0 or 5, by 10 if ends in 0.');

// Seed questions
const insertQuestion = db.prepare(`
  INSERT INTO questions (concept_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Algebra - Variables (concept 1)
insertQuestion.run(1, 1, 'If x = 3, what is x + 4?', '5', '6', '7', '8', 'C', 'Replace x with 3: 3 + 4 = 7');
insertQuestion.run(1, 1, 'If y = 2, what is y × 5?', '7', '10', '8', '12', 'B', 'Replace y with 2: 2 × 5 = 10');
insertQuestion.run(1, 2, 'If a = 4 and b = 3, what is a + b?', '5', '6', '7', '8', 'C', 'Replace a with 4 and b with 3: 4 + 3 = 7');
insertQuestion.run(1, 2, 'If x = 6, what is 2x - 4?', '6', '8', '10', '12', 'B', 'Replace x with 6: 2(6) - 4 = 12 - 4 = 8');
insertQuestion.run(1, 3, 'If p = 5 and q = 2, what is 3p - 2q?', '9', '11', '13', '15', 'B', '3(5) - 2(2) = 15 - 4 = 11');

// Algebra - Expressions (concept 2)
insertQuestion.run(2, 1, 'Simplify: 3 + 5', '6', '7', '8', '9', 'C', 'Simply add: 3 + 5 = 8');
insertQuestion.run(2, 1, 'What is 4 × 3?', '10', '11', '12', '13', 'C', '4 × 3 = 12');
insertQuestion.run(2, 2, 'Simplify: 2 × 3 + 4', '9', '10', '11', '14', 'B', 'Multiply first: 2 × 3 = 6, then add: 6 + 4 = 10');
insertQuestion.run(2, 2, 'What is 15 - 3 × 2?', '9', '24', '6', '12', 'A', 'Multiply first: 3 × 2 = 6, then subtract: 15 - 6 = 9');
insertQuestion.run(2, 3, 'Simplify: 4 × (2 + 3) - 5', '10', '15', '20', '25', 'B', 'Parentheses first: 2 + 3 = 5, then 4 × 5 = 20, finally 20 - 5 = 15');

// Algebra - Equations (concept 3)
insertQuestion.run(3, 1, 'Solve: x + 3 = 7', 'x = 3', 'x = 4', 'x = 5', 'x = 10', 'B', 'Subtract 3 from both sides: x = 7 - 3 = 4');
insertQuestion.run(3, 1, 'Solve: y - 2 = 5', 'y = 3', 'y = 5', 'y = 7', 'y = 10', 'C', 'Add 2 to both sides: y = 5 + 2 = 7');
insertQuestion.run(3, 2, 'Solve: 2x = 10', 'x = 2', 'x = 5', 'x = 8', 'x = 12', 'B', 'Divide both sides by 2: x = 10 ÷ 2 = 5');
insertQuestion.run(3, 2, 'Solve: x + 5 = 12', 'x = 5', 'x = 6', 'x = 7', 'x = 17', 'C', 'Subtract 5 from both sides: x = 12 - 5 = 7');
insertQuestion.run(3, 3, 'Solve: 3x + 2 = 14', 'x = 2', 'x = 3', 'x = 4', 'x = 5', 'C', 'Subtract 2: 3x = 12, divide by 3: x = 4');

// Algebra - Order of Operations (concept 4)
insertQuestion.run(4, 1, 'What comes first in PEMDAS?', 'Addition', 'Multiplication', 'Parentheses', 'Division', 'C', 'PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction');
insertQuestion.run(4, 1, 'Calculate: 2 + 3 × 2', '8', '10', '12', '16', 'A', 'Multiply first: 3 × 2 = 6, then add: 2 + 6 = 8');
insertQuestion.run(4, 2, 'Calculate: (4 + 2) × 3', '10', '14', '18', '24', 'C', 'Parentheses first: 4 + 2 = 6, then multiply: 6 × 3 = 18');
insertQuestion.run(4, 2, 'Calculate: 20 ÷ 4 + 3', '2', '5', '8', '23', 'C', 'Divide first: 20 ÷ 4 = 5, then add: 5 + 3 = 8');
insertQuestion.run(4, 3, 'Calculate: 2 + 3 × 4 - 6 ÷ 2', '8', '11', '13', '9', 'B', 'Multiply: 3×4=12, Divide: 6÷2=3, then 2+12-3=11');

// Geometry - Angles (concept 5)
insertQuestion.run(5, 1, 'How many degrees is a right angle?', '45°', '90°', '180°', '360°', 'B', 'A right angle is exactly 90 degrees');
insertQuestion.run(5, 1, 'What type of angle is 45°?', 'Right', 'Acute', 'Obtuse', 'Straight', 'B', 'An acute angle is less than 90°');
insertQuestion.run(5, 2, 'Two angles add up to 180°. If one is 60°, what is the other?', '100°', '110°', '120°', '130°', 'C', '180° - 60° = 120°');
insertQuestion.run(5, 2, 'What angle is larger than 90° but less than 180°?', 'Acute', 'Right', 'Obtuse', 'Reflex', 'C', 'Obtuse angles are between 90° and 180°');
insertQuestion.run(5, 3, 'If two complementary angles have one at 35°, what is the other?', '45°', '55°', '65°', '145°', 'B', 'Complementary angles add to 90°: 90° - 35° = 55°');

// Geometry - Triangles (concept 6)
insertQuestion.run(6, 1, 'How many sides does a triangle have?', '2', '3', '4', '5', 'B', 'A triangle always has 3 sides');
insertQuestion.run(6, 1, 'What do the angles in a triangle add up to?', '90°', '180°', '270°', '360°', 'B', 'Triangle angles always sum to 180°');
insertQuestion.run(6, 2, 'A triangle has all equal sides. What type is it?', 'Scalene', 'Isosceles', 'Equilateral', 'Right', 'C', 'Equilateral triangles have all equal sides');
insertQuestion.run(6, 2, 'Two angles of a triangle are 60° and 70°. What is the third?', '40°', '50°', '60°', '70°', 'B', '180° - 60° - 70° = 50°');
insertQuestion.run(6, 3, 'An isosceles triangle has two angles of 70° each. What is the third?', '30°', '40°', '50°', '70°', 'B', '180° - 70° - 70° = 40°');

// Geometry - Area and Perimeter (concept 7)
insertQuestion.run(7, 1, 'What is the perimeter of a square with side 4?', '8', '12', '16', '20', 'C', 'Perimeter = 4 × side = 4 × 4 = 16');
insertQuestion.run(7, 1, 'What is the area of a rectangle 3 by 4?', '7', '12', '14', '24', 'B', 'Area = length × width = 3 × 4 = 12');
insertQuestion.run(7, 2, 'A rectangle has length 8 and width 5. What is its perimeter?', '13', '26', '40', '80', 'B', 'Perimeter = 2(8 + 5) = 2(13) = 26');
insertQuestion.run(7, 2, 'What is the area of a square with side 6?', '12', '24', '36', '48', 'C', 'Area = side × side = 6 × 6 = 36');
insertQuestion.run(7, 3, 'A rectangle has perimeter 24 and width 4. What is its length?', '6', '8', '10', '12', 'B', '24 = 2(length + 4), so length + 4 = 12, length = 8');

// Geometry - Circles (concept 8)
insertQuestion.run(8, 1, 'What is the diameter if the radius is 5?', '2.5', '5', '10', '15', 'C', 'Diameter = 2 × radius = 2 × 5 = 10');
insertQuestion.run(8, 1, 'What is the center of a circle called?', 'Radius', 'Diameter', 'Origin', 'Circumference', 'C', 'The center point of a circle is called the origin');
insertQuestion.run(8, 2, 'If the diameter is 14, what is the radius?', '5', '7', '14', '28', 'B', 'Radius = diameter ÷ 2 = 14 ÷ 2 = 7');
insertQuestion.run(8, 2, 'What is the distance around a circle called?', 'Diameter', 'Radius', 'Area', 'Circumference', 'D', 'The circumference is the distance around a circle');
insertQuestion.run(8, 3, 'A circle has radius 3. Using π ≈ 3.14, what is its circumference?', '9.42', '18.84', '28.26', '37.68', 'B', 'C = 2πr = 2 × 3.14 × 3 = 18.84');

// Number Theory - Prime Numbers (concept 9)
insertQuestion.run(9, 1, 'Which of these is a prime number?', '4', '6', '7', '9', 'C', '7 can only be divided by 1 and 7');
insertQuestion.run(9, 1, 'Is 2 a prime number?', 'Yes', 'No', 'Sometimes', 'Only with 1', 'A', '2 is the only even prime number');
insertQuestion.run(9, 2, 'Which is NOT a prime number?', '11', '13', '15', '17', 'C', '15 = 3 × 5, so it has factors other than 1 and itself');
insertQuestion.run(9, 2, 'How many prime numbers are between 1 and 10?', '3', '4', '5', '6', 'B', 'The primes are 2, 3, 5, 7 (four numbers)');
insertQuestion.run(9, 3, 'What is the sum of the first 4 prime numbers?', '15', '17', '18', '20', 'B', '2 + 3 + 5 + 7 = 17');

// Number Theory - Factors (concept 10)
insertQuestion.run(10, 1, 'What are the factors of 6?', '1, 2, 3, 6', '1, 6', '2, 3', '1, 2, 3', 'A', '6 = 1×6 = 2×3, so factors are 1, 2, 3, 6');
insertQuestion.run(10, 1, 'Is 3 a factor of 12?', 'Yes', 'No', 'Sometimes', 'Only with 4', 'A', '12 ÷ 3 = 4, so yes, 3 is a factor');
insertQuestion.run(10, 2, 'What is the greatest common factor of 8 and 12?', '2', '4', '6', '8', 'B', 'Factors of 8: 1,2,4,8. Factors of 12: 1,2,3,4,6,12. GCF = 4');
insertQuestion.run(10, 2, 'How many factors does 10 have?', '2', '3', '4', '5', 'C', 'Factors of 10: 1, 2, 5, 10 (four factors)');
insertQuestion.run(10, 3, 'What is the GCF of 24 and 36?', '6', '8', '12', '18', 'C', 'Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. GCF = 12');

// Number Theory - Multiples (concept 11)
insertQuestion.run(11, 1, 'What is the 3rd multiple of 4?', '8', '12', '16', '20', 'B', '4 × 3 = 12');
insertQuestion.run(11, 1, 'Is 15 a multiple of 5?', 'Yes', 'No', 'Sometimes', 'Only if divided', 'A', '15 = 5 × 3, so yes');
insertQuestion.run(11, 2, 'What is the LCM of 3 and 4?', '7', '12', '1', '24', 'B', 'Multiples of 3: 3,6,9,12... Multiples of 4: 4,8,12... LCM = 12');
insertQuestion.run(11, 2, 'What is the 5th multiple of 6?', '24', '30', '36', '42', 'B', '6 × 5 = 30');
insertQuestion.run(11, 3, 'What is the LCM of 4 and 6?', '8', '10', '12', '24', 'C', 'Multiples of 4: 4,8,12... Multiples of 6: 6,12... LCM = 12');

// Number Theory - Divisibility Rules (concept 12)
insertQuestion.run(12, 1, 'Is 24 divisible by 2?', 'Yes', 'No', 'Sometimes', 'Only with remainder', 'A', '24 is even, so it is divisible by 2');
insertQuestion.run(12, 1, 'Is 35 divisible by 5?', 'Yes', 'No', 'Sometimes', 'Only with 7', 'A', '35 ends in 5, so it is divisible by 5');
insertQuestion.run(12, 2, 'Is 123 divisible by 3?', 'Yes', 'No', 'Sometimes', 'Only with 41', 'A', '1+2+3=6, which is divisible by 3');
insertQuestion.run(12, 2, 'Which number is divisible by both 2 and 5?', '15', '24', '30', '35', 'C', '30 is even (div by 2) and ends in 0 (div by 5)');
insertQuestion.run(12, 3, 'Is 234 divisible by 9?', 'Yes', 'No', 'Sometimes', 'Only by 3', 'A', '2+3+4=9, which is divisible by 9');

// Seed puzzles
const insertPuzzle = db.prepare('INSERT INTO puzzles (concept_id, title, puzzle_text, hint, solution) VALUES (?, ?, ?, ?, ?)');

// Algebra puzzles
insertPuzzle.run(1, 'Mystery Number', 'I am thinking of a number. If you add 7 to it and then double the result, you get 24. What is my number?', 'Start by figuring out what number, when doubled, gives 24.', 'The number is 5. If we double 12 we get 24, so the number plus 7 is 12. Therefore, the number is 12 - 7 = 5.');
insertPuzzle.run(2, 'Age Puzzle', 'Tom is twice as old as his sister. In 5 years, he will be 15. How old is his sister now?', 'First find Toms current age.', 'Tom is 10 now (15 - 5). His sister is half his age, so she is 5 years old.');
insertPuzzle.run(3, 'Balance Scale', 'A balance scale has 3 identical boxes on one side and a 15kg weight on the other. They balance perfectly. How heavy is each box?', 'The total weight of boxes must equal 15kg.', 'Each box weighs 5kg because 3 × 5 = 15.');
insertPuzzle.run(4, 'Calculation Challenge', 'Using only +, -, ×, ÷ and parentheses, can you make 24 from 8, 3, 8, and 3?', 'Try multiplying two numbers together first.', 'One solution: 8 ÷ (3 - 8 ÷ 3) = 24, or (3 + 3) × (8 - 8 ÷ 8) = 24');

// Geometry puzzles
insertPuzzle.run(5, 'Clock Angle', 'What is the angle between the hour and minute hands of a clock at 3:00?', 'Think about how many degrees each hour mark represents.', 'At 3:00, the hands form a 90° angle (right angle). Each hour = 360° ÷ 12 = 30°, and 3 hours × 30° = 90°.');
insertPuzzle.run(6, 'Triangle Challenge', 'Can you make a triangle with sticks of length 2, 3, and 6 units?', 'Remember: the sum of any two sides must be greater than the third side.', 'No! 2 + 3 = 5, which is less than 6. The triangle inequality is not satisfied.');
insertPuzzle.run(7, 'Garden Problem', 'You have 20 meters of fencing to make a rectangular garden. What dimensions give you the largest area?', 'The perimeter is fixed at 20m. Try different length and width combinations.', 'A 5m × 5m square gives the largest area of 25 square meters. Squares are the most efficient rectangles!');
insertPuzzle.run(8, 'Pizza Puzzle', 'A pizza has diameter 12 inches. If you cut it into 8 equal slices, what is the area of each slice? (Use π ≈ 3.14)', 'First find the total area, then divide.', 'Total area = π × 6² = 3.14 × 36 = 113.04 sq inches. Each slice = 113.04 ÷ 8 ≈ 14.13 sq inches.');

// Number Theory puzzles
insertPuzzle.run(9, 'Prime Hunt', 'Find all the prime numbers between 20 and 30.', 'Check each number to see if it has any factors other than 1 and itself.', 'The primes are 23 and 29. Numbers like 21 (3×7), 22 (2×11), 24, 25 (5×5), 26, 27 (3×9), 28 are not prime.');
insertPuzzle.run(10, 'Factor Fun', 'I am a two-digit number. My factors are 1, 2, 4, 8, 16, and myself. What number am I?', 'The number must be divisible by 16 and have no other factors.', 'The number is 16! Wait, but 16 is only one digit... Actually it is 32 (factors: 1,2,4,8,16,32).');
insertPuzzle.run(11, 'LCM Mystery', 'Two buses leave the station at 8:00 AM. Bus A comes every 12 minutes, Bus B every 15 minutes. When will they both be at the station again?', 'Find the LCM of 12 and 15.', 'LCM(12,15) = 60. They will both be back at 9:00 AM (60 minutes later).');
insertPuzzle.run(12, 'Divisibility Detective', 'What is the smallest positive number divisible by both 6 and 8?', 'This is asking for the LCM of 6 and 8.', 'LCM(6,8) = 24. Check: 24÷6=4 ✓ and 24÷8=3 ✓');

// Seed default teacher account
const passwordHash = bcrypt.hashSync('teacherpass', 10);
db.prepare('INSERT INTO teachers (username, password_hash) VALUES (?, ?)').run('teacher', passwordHash);

// Seed some sample students
db.prepare('INSERT INTO students (name, total_points) VALUES (?, ?)').run('Alex', 150);
db.prepare('INSERT INTO students (name, total_points) VALUES (?, ?)').run('Jordan', 200);

console.log('Database seeded successfully!');
console.log('Default teacher login: username="teacher", password="teacherpass"');
