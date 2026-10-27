import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);

  // Initial session verification via HTTP-only cookie
  const checkAuth = useCallback(async () => {
    try {
      const userData = await api.auth.getMe();
      setUser(userData);
      setServerOnline(true);
    } catch (err) {
      setUser(null);
      if (err.status === 503) {
        setServerOnline(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        serverOnline,
        login,
        register,
        logout,
        checkAuth,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
