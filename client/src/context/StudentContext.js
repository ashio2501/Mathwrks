import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentApi } from '../services/api';

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token
    const token = localStorage.getItem('studentToken');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const data = await studentApi.getMe();
      setStudent(data);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('studentToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await studentApi.login(username, password);
    localStorage.setItem('studentToken', data.token);
    setStudent(data.student);
    return data;
  };

  const register = async (username, password, name) => {
    const data = await studentApi.register(username, password, name);
    localStorage.setItem('studentToken', data.token);
    setStudent(data.student);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    setStudent(null);
  };

  const refreshStudent = async () => {
    if (student) {
      try {
        const data = await studentApi.getMe();
        setStudent(data);
      } catch (error) {
        console.error('Failed to refresh student:', error);
      }
    }
  };

  const updatePoints = (points) => {
    if (student) {
      setStudent(prev => ({
        ...prev,
        total_points: prev.total_points + points
      }));
    }
  };

  return (
    <StudentContext.Provider value={{
      student,
      loading,
      isAuthenticated: !!student,
      login,
      register,
      logout,
      refreshStudent,
      updatePoints
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
