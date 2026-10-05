import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 60 * 1000; // 1 minute warning

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setInactivityWarning(false);
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      const data = res.data.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
      resetInactivityTimer();
      return { success: true, user: data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (verificationCode) => {
    setLoading(true);
    try {
      const res = await api.post(`/auth/verify-email?token=${encodeURIComponent(verificationCode)}`);
      const data = res.data.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
      resetInactivityTimer();
      return { success: true, user: data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fullName, mobileNumber) => {
    try {
      const res = await api.put('/users/profile', { fullName, mobileNumber });
      const updated = { ...user, fullName: res.data.data.fullName, mobileNumber: res.data.data.mobileNumber };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  // Activity tracker
  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    setInactivityWarning(false);
  };

  useEffect(() => {
    if (!token) return;

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (inactivityWarning) {
        setInactivityWarning(false);
      }
    };

    activityEvents.forEach((ev) => window.addEventListener(ev, handleActivity));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT) {
        logout();
        alert('You have been logged out due to inactivity.');
      } else if (elapsed >= INACTIVITY_TIMEOUT - WARNING_BEFORE) {
        setInactivityWarning(true);
      }
    }, 10000);

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(checkInterval);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [token, inactivityWarning]);

  const value = {
    user,
    token,
    loading,
    inactivityWarning,
    resetInactivityTimer,
    login,
    register,
    verifyEmail,
    logout,
    updateProfile,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {inactivityWarning && (
        <div className="fixed bottom-4 right-4 z-50 bg-amber-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce">
          <div>
            <p className="font-bold">Inactivity Notice</p>
            <p className="text-sm">You will be logged out in less than a minute due to inactivity.</p>
          </div>
          <button
            onClick={resetInactivityTimer}
            className="px-3 py-1.5 bg-white text-amber-700 font-semibold rounded-lg shadow hover:bg-amber-50 text-sm"
          >
            Stay Logged In
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
