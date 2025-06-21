import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { SESSION_TIMEOUT_EVENT, logout } from '../../services/userService';

/**
 * Component that listens for session timeout events and shows a notification
 * and automatically logs out the user.
 */
const SessionTimeoutAlert = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handler for session timeout events
    const handleSessionTimeout = (event) => {
      toast.error("Your session has expired. Please login again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Automatically logout and redirect to login page after a short delay
      // to allow the toast to be visible
      setTimeout(() => {
        logout(navigate);
      }, 500);
    };

    // Add event listener for the custom session timeout event
    window.addEventListener(SESSION_TIMEOUT_EVENT, handleSessionTimeout);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener(SESSION_TIMEOUT_EVENT, handleSessionTimeout);
    };
  }, [navigate]);

  // This component doesn't render anything visible
  return null;
};

export default SessionTimeoutAlert;
