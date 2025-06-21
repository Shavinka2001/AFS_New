import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/order';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token and add Authorization header
const authHeader = () => {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  token = token?.replace(/^"|"$/g, ''); // Remove surrounding quotes
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new work order
export const createWorkOrder = async (orderData) => {
  try {
    console.log('Creating work order with data:', orderData); // Debug log
    const response = await api.post('/', orderData, {
      headers: authHeader(),
    });
    console.log('Create work order response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error creating work order:', error.response || error); // Debug log
    throw new Error(error.response?.data?.message || 'Failed to create work order');
  }
};

// Get all work orders
export const getWorkOrders = async () => {
  try {
    const response = await api.get('/', {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch work orders');
  }
};

export const getWorkOrdersByUserId = async (userId) => {
  try {
    console.log('Fetching work orders for user ID:', userId); // Debug log
    const response = await api.get(`/user/${userId}`, {
      headers: authHeader(),
    });
    console.log('Get work orders by user response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching user work orders:', error.response || error); // Debug log
    throw new Error(error.response?.data?.message || 'Failed to fetch user work orders');
  }
};

// Get a single work order by ID
export const getWorkOrderById = async (id) => {
  try {
    const response = await api.get(`/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a work order
export const updateWorkOrder = async (id, orderData) => {
  try {
    const response = await api.put(`/${id}`, orderData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update work order');
  }
};

// Delete a work order
export const deleteWorkOrder = async (id) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete work order');
  }
};

// Search work orders
export const searchWorkOrders = async (searchParams) => {
  try {
    const response = await api.get('/search', {
      params: searchParams,
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search work orders');
  }
};
