import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * A wrapper for routes that need admin privileges
 * Redirects to user dashboard if authenticated but not admin
 * Redirects to login if not authenticated
 */
const AdminRoute = ({ children }) => {  const { isAuthenticated, user, isLoading, isAdmin } = useAuth();
  
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
        const parsedUser = JSON.parse(userData);
        // Check if user is admin even when auth context hasn't fully loaded
        if (parsedUser && (parsedUser.isAdmin || parsedUser.userType === 'admin')) {
          return children;
        } else {
          toast.error('Access denied. You need admin privileges to view this page.');
          return <Navigate to="/user/dashboard" replace />;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        return <Navigate to="/login" replace />;
      }
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // Check if user has admin privileges using the helper from AuthContext
  if (!isAdmin) {
    toast.error('Access denied. You need admin privileges to view this page.');
    return <Navigate to="/user/dashboard" replace />;
  }
  
  // User is authenticated and has admin privileges
  return children;
};

export default AdminRoute;
