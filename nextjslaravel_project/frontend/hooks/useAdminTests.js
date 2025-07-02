import { useState } from 'react';
import api from '@/utils/api';

export const useAdminTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/tests');
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
      const response = await api.post('/admin/tests', testData);
      setTests(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Sesi login telah berakhir. Silakan login kembali.');
        return;
      }
      if (err.response?.status === 403) {
        alert('Anda tidak memiliki akses ke halaman ini.');
        return;
      }
      throw new Error(err.response?.data?.message || 'Failed to create test');
    }
  };

  const updateTest = async (id, testData) => {
    try {
      const response = await api.put(`/admin/tests/${id}`, testData);
      setTests(prev => prev.map(test => test.id === id ? response.data : test));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update test');
    }
  };

  const deleteTest = async (id) => {
    try {
      await api.delete(`/admin/tests/${id}`);
      setTests(prev => prev.filter(test => test.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete test');
    }
  };

  const getTest = async (id) => {
    try {
      const response = await api.get(`/admin/tests/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get test');
    }
  };

  return {
    tests,
    loading,
    error,
    fetchTests,
    createTest,
    updateTest,
    deleteTest,
    getTest
  };
};
