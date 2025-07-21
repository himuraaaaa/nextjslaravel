import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      checkAuthStatus();
    }
    setLoading(false);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      logout();
    }
  };

  // LOGIN dengan reCAPTCHA
  const login = async (email, password, recaptchaToken) => {
    try {
      // Get CSRF cookie first (Laravel Sanctum)
      const csrfApi = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
      });
      await csrfApi.get('/sanctum/csrf-cookie');
      
      // Kirim data login + token reCAPTCHA ke backend
      const response = await api.post('/login', {
        email,
        password,
        'g-recaptcha-response': recaptchaToken,
      });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // REGISTER dengan reCAPTCHA (opsional, kalau mau dipakai juga)
  const register = async (name, email, password, recaptchaToken) => {
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        'g-recaptcha-response': recaptchaToken,
      });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
