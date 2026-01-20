import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentApi } from '../services/api';

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved student in localStorage
    const savedStudentId = localStorage.getItem('studentId');
    if (savedStudentId) {
      loadStudent(savedStudentId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudent = async (id) => {
    try {
      const data = await studentApi.getById(id);
      setStudent(data);
      localStorage.setItem('studentId', id);
    } catch (error) {
      console.error('Failed to load student:', error);
      localStorage.removeItem('studentId');
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (studentData) => {
    setStudent(studentData);
    localStorage.setItem('studentId', studentData.id);
  };

  const createStudent = async (name) => {
    const newStudent = await studentApi.create(name);
    setStudent(newStudent);
    localStorage.setItem('studentId', newStudent.id);
    return newStudent;
  };

  const refreshStudent = async () => {
    if (student) {
      await loadStudent(student.id);
    }
  };

  const clearStudent = () => {
    setStudent(null);
    localStorage.removeItem('studentId');
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
      selectStudent,
      createStudent,
      refreshStudent,
      clearStudent,
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
