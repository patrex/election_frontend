import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [voter, setVoter] = useState(null);
  const [electionId, setElectionId] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Assume your backend has a /me endpoint that returns user data from a cookie/token
        const { data } = await axios.get('/api/auth/me');
        setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await axios.post('/api/auth/login', credentials);
    setUser(data.user);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  // Function to refresh user data (useful after email verification)
  const refreshUser = async () => {
    const { data } = await axios.get('/api/auth/me');
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// The custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};