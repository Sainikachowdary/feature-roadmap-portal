import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await client.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      setUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.full_name}!`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const signup = async (email, password, full_name) => {
    try {
      const res = await client.post('/auth/signup', { email, password, full_name });
      showToast('Account created! Please verify your email.', 'success');
      return { success: true, user: res.data };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Signup failed.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      showToast('You have been logged out.', 'info');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      showToast,
      toast,
      isAdmin: user?.role === 'ADMIN',
      refreshUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
