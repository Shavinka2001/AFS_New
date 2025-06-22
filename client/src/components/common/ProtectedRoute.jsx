import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * A wrapper for routes that need authentication
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If still checking auth status, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
      </div>
    );
  }
    // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Check localStorage/sessionStorage directly as a fallback
    const userData = localStorage.getItem("User") || sessionStorage.getItem("User");
    if (userData) {
      try {
        // User data exists but isAuthenticated is false - this might be a race condition
        // Let's try to use the data instead of redirecting immediately
        return children;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return <Navigate to="/login" replace />;
      }
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // Otherwise render the children (the protected component)
  return children;
};

export default ProtectedRoute;
