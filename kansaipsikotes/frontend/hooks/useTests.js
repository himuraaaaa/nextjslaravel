import { useState, useEffect } from 'react';
import api from '@/utils/api';

export const useTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/available-tests');
      setTests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const createTest = async (testData) => {
    try {
      const response = await api.post('/tests', testData);
      setTests(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create test');
    }
  };

  const deleteTest = async (testId) => {
    try {
      await api.delete(`/tests/${testId}`);
      setTests(prev => prev.filter(test => test.id !== testId));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete test');
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return {
    tests,
    loading,
    error,
    fetchTests,
    createTest,
    deleteTest
  };
};
