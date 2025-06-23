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
    let isMounted = true; // Flag to prevent state updates after unmount
    
    const checkAuth = async () => {
      try {
        // Check both User and user keys for backward compatibility
        const userData = localStorage.getItem('User') || sessionStorage.getItem('User') || 
                         localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (isMounted) setUser(parsedUser);
          
          try {
            // Verify the token with the server
            await verifyAuth();
            if (isMounted) setIsAuthenticated(true);
          } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            // Don't log out here, just set auth state to false
            if (isMounted) {
              setIsAuthenticated(false);
              // We keep the user object to prevent flickering
            }
          }
        } else {
          // No user data found
          if (isMounted) setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          // Don't auto logout here to prevent infinite redirect loops
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Only run on component mount
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
  // Add isAdmin helper function
  const isAdmin = user?.isAdmin || user?.userType === 'admin';
  
  const value = {
    isAuthenticated,
    user,
    isLoading,
    logout: handleLogout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
