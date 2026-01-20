import { useState, useCallback } from 'react';
import { quizApi } from '../services/api';

export function useQuiz() {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  const startQuiz = useCallback(async (studentId, moduleId) => {
    setLoading(true);
    setError(null);
    try {
      const sessionData = await quizApi.start(studentId, moduleId);
      setSession(sessionData);
      setCompleted(false);
      setResult(null);
      return sessionData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNextQuestion = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await quizApi.getNext(sessionId);
      if (data.completed) {
        setCompleted(true);
        setQuestion(null);
      } else {
        setQuestion(data);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (sessionId, questionId, answer) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizApi.submitAnswer(sessionId, questionId, answer);
      setResult(data);

      // Update session with new difficulty if changed
      if (data.difficultyChanged) {
        setSession(prev => ({
          ...prev,
          currentDifficulty: data.newDifficulty,
          difficultyLabel: data.difficultyLabel
        }));
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledgeAnswer = useCallback(async (sessionId, answerId, text) => {
    try {
      await quizApi.acknowledge(sessionId, answerId, text);
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  }, []);

  const endQuiz = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const summary = await quizApi.end(sessionId);
      return summary;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setSession(null);
    setQuestion(null);
    setResult(null);
    setCompleted(false);
    setError(null);
  }, []);

  return {
    session,
    question,
    result,
    loading,
    error,
    completed,
    startQuiz,
    getNextQuestion,
    submitAnswer,
    acknowledgeAnswer,
    endQuiz,
    resetQuiz
  };
}
