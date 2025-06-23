import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SESSION_TIMEOUT_EVENT } from '../../services/userService';

const SessionTimeoutAlert = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if redirected from an auto-logout
    if (location.state?.autoLogout) {
      toast.error('Your session has expired. Please log in again.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }

    // Check session storage for auth message (for non-React Router redirects)
    const authMessage = sessionStorage.getItem('authMessage');
    if (authMessage) {
      toast.error(authMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      sessionStorage.removeItem('authMessage');
    }

    // Function to handle session timeout events
    const handleSessionTimeout = () => {
      // Only show the alert if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Your session has expired. You will be redirected to login.', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          onClose: () => {
            // After the toast is closed, redirect to login
            navigate('/login', { 
              replace: true,
              state: { 
                message: 'Your session has expired. Please log in again.',
                autoLogout: true 
              }
            });
          }
        });
      }
    };

    // Add event listener
    window.addEventListener(SESSION_TIMEOUT_EVENT, handleSessionTimeout);

    // Clean up
    return () => {
      window.removeEventListener(SESSION_TIMEOUT_EVENT, handleSessionTimeout);
    };
  }, [navigate, location]);

  // This component doesn't render anything visual
  return null;
};

export default SessionTimeoutAlert;
