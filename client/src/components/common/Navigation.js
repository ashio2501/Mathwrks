import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import PointsDisplay from './PointsDisplay';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const { student, logout: studentLogout } = useStudent();
  const { isAuthenticated, logout } = useAuth();

  const isTeacherRoute = location.pathname.startsWith('/teacher');

  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">MathWrks</span>
        </Link>

        <div className="nav-right">
          {!isTeacherRoute && student && (
            <>
              <PointsDisplay points={student.total_points} />
              <span className="student-name">{student.name}</span>
              <button className="nav-btn" onClick={studentLogout}>
                Logout
              </button>
            </>
          )}

          {isTeacherRoute && isAuthenticated && (
            <>
              <Link to="/teacher/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/teacher/questions" className="nav-link">Questions</Link>
              <button className="nav-btn" onClick={logout}>
                Logout
              </button>
            </>
          )}

          {!isTeacherRoute && (
            <Link to="/teacher" className="nav-link teacher-link">
              Teacher Mode
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
