import axios from 'axios';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://4.236.138.4:5001';

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

// Get buildings for a location
export const getBuildingsForLocation = async (locationId) => {
  try {
    const response = await api.get(`/api/locations/${locationId}/buildings`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching buildings for location ${locationId}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         `Error fetching buildings for location`;
    throw { message: errorMessage, originalError: error };
  }
};

// Add building to location
export const addBuildingToLocation = async (locationId, buildingData) => {
  try {
    const response = await api.post(`/api/locations/${locationId}/buildings`, buildingData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding building to location ${locationId}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error adding building';
    throw { message: errorMessage, originalError: error };
  }
};

// Update building in location
export const updateBuildingInLocation = async (locationId, buildingId, buildingData) => {
  try {
    const response = await api.put(`/api/locations/${locationId}/buildings/${buildingId}`, buildingData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating building ${buildingId} in location ${locationId}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error updating building';
    throw { message: errorMessage, originalError: error };
  }
};

// Delete building from location
export const deleteBuildingFromLocation = async (locationId, buildingId) => {
  try {
    const response = await api.delete(`/api/locations/${locationId}/buildings/${buildingId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting building ${buildingId} from location ${locationId}:`, error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error deleting building';
    throw { message: errorMessage, originalError: error };
  }
};
