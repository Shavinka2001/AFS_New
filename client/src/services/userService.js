import axios from 'axios';

// Create a custom event for session timeout
const SESSION_TIMEOUT_EVENT = 'sessionTimeout';
const emitSessionTimeout = () => {
    window.dispatchEvent(new CustomEvent(SESSION_TIMEOUT_EVENT));
};

const API_URL = 'http://localhost:5001/api/auth';

// Token management - Moving these functions up so they're defined before being used
const getAccessToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

const setAccessToken = (token) => {
    const storage = localStorage.getItem('useSessionStorage') ? sessionStorage : localStorage;
    storage.setItem('accessToken', token);
};

const getUser = () => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    timeout: 10000 // 10 seconds timeout
});

// Add request interceptor to attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a global axios interceptor for all requests in the app
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if unauthorized error from any API
        if (error.response?.status === 401) {
            // Only trigger logout if not already on login page
            if (!window.location.pathname.includes('/login')) {
                console.log('Global unauthorized access detected, logging out user automatically');
                emitSessionTimeout();
                // Use the logout function without navigate to force a redirect
                logout();
            }
        }
        return Promise.reject(error);
    }
);

// Session timeout handling
let sessionTimer = null;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const resetSessionTimer = () => {
    if (sessionTimer) {
        clearTimeout(sessionTimer);
    }
    
    // Set a timer that will trigger logout when session expires
    sessionTimer = setTimeout(() => {
        // Check if there's a valid token before logging out
        const token = getAccessToken();
        if (token) {
            // Try to refresh once before logout
            refreshToken().catch(() => {
                emitSessionTimeout();
                logout();
            });
        }
    }, SESSION_DURATION);
};

// Auth functions
const logout = (navigate) => {
    // Clear the session timer
    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
    
    // Clear all auth data
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('User');
    sessionStorage.removeItem('User');
    
    // Optional: Clear refresh token cookie by setting expired date
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // If navigate function is provided, use React Router navigation (preferred)
    if (navigate && typeof navigate === 'function') {
        navigate('/login', { 
            replace: true,
            state: { 
                message: 'Your session has expired. Please log in again.',
                autoLogout: true 
            } 
        });
    } else {
        // Store a session expiration message that login page can display
        sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
        
        // Fallback to direct URL change - use replace to prevent history issues
        window.location.replace('/login');
    }
};

const refreshToken = async () => {
    try {
        // The cookie is sent automatically with the request
        const response = await axios.post(`${API_URL}/refresh-token`, {}, { withCredentials: true });
        
        if (response.data && response.data.accessToken) {
            // Update both storage locations to maintain consistency
            const storage = localStorage.getItem('useSessionStorage') ? sessionStorage : localStorage;
            
            // Store under both key names for consistency with existing code
            storage.setItem('accessToken', response.data.accessToken);
            storage.setItem('token', response.data.accessToken);
            
            // Update user data if provided
            if (response.data.user) {
                storage.setItem('user', JSON.stringify(response.data.user));
                storage.setItem('User', JSON.stringify(response.data.user));
            }
        }
        
        return response.data;
    } catch (error) {
        console.error('Token refresh failed:', error);
        
        // Check if this is an expiry-related error
        if (error.response?.data?.expired) {
            // Emit session timeout event to trigger automatic logout
            emitSessionTimeout();
        }
        
        throw error;
    }
};

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        // If error is 401 and not already retrying
        if (error.response?.status === 401 && 
            error.response?.data?.expired === true && 
            !originalRequest._retry) {
            
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const response = await refreshToken();
                
                // If token refresh is successful, retry the original request
                setAccessToken(response.accessToken);
                
                // Reset the session timer when token is refreshed
                resetSessionTimer();
                
                originalRequest.headers['Authorization'] = `Bearer ${response.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout user and notify about session timeout
                console.log('Token refresh failed, logging out user automatically');
                emitSessionTimeout();
                logout();
                return Promise.reject(refreshError);
            }
        }
        
        // If token is invalid or other 401 error
        if (error.response?.status === 401) {
            console.log('Unauthorized access detected, logging out user automatically');
            emitSessionTimeout();
            logout();
        }
        
        return Promise.reject(error);
    }
);

// Initialize session timer
const initSessionMonitoring = () => {
    // Reset timer on user activity
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
        window.addEventListener(event, resetSessionTimer, false);
    });
    
    // Initial timer setup if token exists
    if (getAccessToken()) {
        resetSessionTimer();
    }
};

const login = async (email, password, rememberMe) => {
    try {
        const response = await api.post('/login', { email, password });
        
        // Set storage preference
        if (rememberMe) {
            localStorage.removeItem('useSessionStorage');
        } else {
            localStorage.setItem('useSessionStorage', 'true');
        }
        
        // Store user info and token
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Store tokens consistently under the same key names used throughout the app
        storage.setItem('accessToken', response.data.accessToken);
        storage.setItem('token', response.data.accessToken); // For legacy code
        
        // Store user data consistently
        storage.setItem('user', JSON.stringify(response.data.user));
        storage.setItem('User', JSON.stringify(response.data.user)); // For legacy code
        
        // Start the session timer
        resetSessionTimer();
        
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const register = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const updateProfile = async (formData) => {
    try {
        const response = await api.put('/self', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // Update stored user data
        const user = getUser();
        if (user) {
            const storage = localStorage.getItem('useSessionStorage') ? sessionStorage : localStorage;
            storage.setItem('user', JSON.stringify({...user, ...response.data}));
        }
        
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const verifyAuth = async () => {
    try {
        const response = await api.get('/verify-token');
        return response.data;
    } catch (error) {
        logout();
        throw error.response?.data || error;
    }
};

// Get all technicians (users with 'user' role)
const getTechnicians = async () => {
    try {
        const response = await api.get('/');
        // Filter users with 'user' role only
        return response.data.filter(user => user.userType === 'user' && user.isActive);
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get technician by ID
const getTechnicianById = async (id) => {
    try {
        // Add a token to ensure the request is authenticated
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        token = token?.replace(/^"|"$/g, '');
        
        const response = await axios.get(`http://localhost:5001/api/auth/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching technician details:', error);
        return null; // Return null instead of throwing to avoid breaking the UI
    }
};

// Initialize session monitoring after all functions are defined
initSessionMonitoring();

export {
    login,
    logout,
    register,
    updateProfile,
    getUser,
    verifyAuth,
    api as authApi,
    SESSION_TIMEOUT_EVENT,
    getTechnicians,
    getTechnicianById
};