import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { AuthProvider } from './context/AuthContext';

// Student components
import StudentEntry from './components/student/StudentEntry';
import ModuleSelect from './components/student/ModuleSelect';
import Quiz from './components/student/Quiz';
import QuizSummary from './components/student/QuizSummary';

// Teacher components
import TeacherLogin from './components/teacher/TeacherLogin';
import Dashboard from './components/teacher/Dashboard';
import QuestionEditor from './components/teacher/QuestionEditor';

// Common components
import Navigation from './components/common/Navigation';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentProvider>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <Routes>
                {/* Student Routes */}
                <Route path="/" element={<StudentEntry />} />
                <Route path="/modules" element={<ModuleSelect />} />
                <Route path="/quiz/:sessionId" element={<Quiz />} />
                <Route path="/summary/:sessionId" element={<QuizSummary />} />

                {/* Teacher Routes */}
                <Route path="/teacher" element={<TeacherLogin />} />
                <Route path="/teacher/dashboard" element={<Dashboard />} />
                <Route path="/teacher/questions" element={<QuestionEditor />} />
              </Routes>
            </main>
          </div>
        </StudentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
