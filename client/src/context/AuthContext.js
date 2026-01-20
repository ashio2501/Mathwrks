import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token
    const token = localStorage.getItem('teacherToken');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const data = await authApi.verify();
      if (data.valid) {
        setTeacher(data.teacher);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem('teacherToken', data.token);
    setTeacher(data.teacher);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('teacherToken');
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{
      teacher,
      loading,
      isAuthenticated: !!teacher,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
