import { useState } from 'react';
import api from '@/utils/api';

export const useAdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/questions');
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData) => {
    try {
      const response = await api.post('/admin/questions', questionData);
      setQuestions(prev => [...prev, response.data]);
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
      throw new Error(err.response?.data?.message || 'Failed to create question');
    }
  };

  const updateQuestion = async (id, questionData) => {
    try {
      const response = await api.put(`/admin/questions/${id}`, questionData);
      setQuestions(prev => prev.map(question => question.id === id ? response.data : question));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update question');
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await api.delete(`/admin/questions/${id}`);
      setQuestions(prev => prev.filter(question => question.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const getQuestion = async (id) => {
    try {
      const response = await api.get(`/admin/questions/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get question');
    }
  };

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestion
  };
}; 