import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/locations';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token and add Authorization header
const authHeader = () => {
  let token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || 
              localStorage.getItem("token") || sessionStorage.getItem("token");  
  token = token?.replace(/^"|"$/g, ''); // Remove surrounding quotes
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new location
export const createLocation = async (locationData) => {
  try {
    const response = await api.post('/', locationData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error creating location';
    throw { message: errorMessage, originalError: error };
  }
};

// Get all locations
export const getLocations = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/', {
      headers: authHeader(),
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting locations:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error retrieving locations';
    throw { message: errorMessage, originalError: error };
  }
};

// Get a single location by ID
export const getLocationById = async (id) => {
  try {
    const response = await api.get(`/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting location with id ${id}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         `Error retrieving location with id ${id}`;
    throw { message: errorMessage, originalError: error };
  }
};

// Update a location
export const updateLocation = async (id, locationData) => {
  try {
    const response = await api.put(`/${id}`, locationData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating location with id ${id}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         `Error updating location with id ${id}`;
    throw { message: errorMessage, originalError: error };
  }
};

// Delete a location
export const deleteLocation = async (id) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting location with id ${id}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         `Error deleting location with id ${id}`;
    throw { message: errorMessage, originalError: error };
  }
};

// Search locations
export const searchLocations = async (searchParams) => {
  try {
    const response = await api.get('/search', {
      headers: authHeader(),
      params: searchParams
    });
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error searching locations';
    throw { message: errorMessage, originalError: error };
  }
};

// Get nearby locations
export const getNearbyLocations = async (latitude, longitude, maxDistance) => {
  try {
    const response = await api.get('/nearby', {
      headers: authHeader(),
      params: { latitude, longitude, maxDistance }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting nearby locations:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error getting nearby locations';
    throw { message: errorMessage, originalError: error };
  }
};

// Get locations assigned to the logged-in technician
export const getAssignedLocations = async () => {
  try {
    const response = await api.get('/assigned/me', {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error getting assigned locations:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error retrieving assigned locations';
    throw { message: errorMessage, originalError: error };
  }
};

// Assign technicians to a location
export const assignTechnicians = async (locationId, technicianIds) => {
  try {
    const response = await api.post(`/${locationId}/assign-technicians`, 
      { technicianIds },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning technicians:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error assigning technicians';
    throw { message: errorMessage, originalError: error };
  }
};
