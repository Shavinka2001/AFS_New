import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAuth, SESSION_TIMEOUT_EVENT, logout } from '../services/userService';
import { toast } from 'react-toastify';

// Create context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('User') || sessionStorage.getItem('User');
        if (userData) {
          setUser(JSON.parse(userData));
          await verifyAuth();
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
        setUser(null);
        // Auto logout if verification fails
        handleLogout(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle user logout
  const handleLogout = (showMessage = true) => {
    logout(navigate);
    setIsAuthenticated(false);
    setUser(null);
    if (showMessage) {
      toast.info('You have been logged out successfully.');
    }
  };

  // Listen for session timeout events
  useEffect(() => {
    const handleSessionTimeout = () => {
      setIsAuthenticated(false);
      setUser(null);
      // We don't call logout here as the event handler in SessionTimeoutAlert 
      // will handle that, we just update the state
    };

    window.addEventListener(SESSION_TIMEOUT_EVENT, handleSessionTimeout);
    return () => {
      window.removeEventListener(SESSION_TIMEOUT_EVENT, handleSessionTimeout);
    };
  }, [navigate]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
