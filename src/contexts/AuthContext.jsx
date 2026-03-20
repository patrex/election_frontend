import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import backendurl from '@/utils/backendurl';
import EmailVerificationLanding from '@/pages/EmailVerificationLanding';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [voter, setVoter] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Assume your backend has a /me endpoint that returns user data from a cookie/token
        const { data } = await axios.get(`${backendurl}user/auth/me`);
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
    try {
      const req  = await axios.post(`${backendurl}user/auth/login`, credentials);
      const user = req.data;
      setUser(user);
      
    } catch (error) {
      
    }
  };

  const logout = async () => {
    await axios.post(`${backendurl}user/auth/logout`);
    setUser(null);
  };

  // Function to refresh user data (useful after email verification)
  const refreshUser = async () => {
    const { data } = await axios.get(`${backendurl}user/auth/me`);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, voter, setVoter }}>
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

export function ProtectedRoute() {
	const { user, loading } = useAuth();

	if (loading) return <div>Loading...</div>;

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// If logged in but not verified, show the landing page we created
	if (!user.verified) {
		return <EmailVerificationLanding userEmail={user.email} />;
	}

	// If verified, render the child routes (Dashboard, Profile, etc.)
	return <Outlet />;
}