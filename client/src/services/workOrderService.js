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
    
    // Generate a unique ID with pattern 0001, 0002, etc. if not provided
    if (!orderData.uniqueId) {
      try {
        // Get current orders to determine next ID
        const currentOrders = await getWorkOrders();
        const nextNumber = (currentOrders?.length || 0) + 1;
        // Format as 4-digit number with leading zeros
        orderData.uniqueId = String(nextNumber).padStart(4, '0');
      } catch (err) {
        console.error('Error generating unique ID:', err);
        // Fallback to timestamp-based ID
        orderData.uniqueId = new Date().getTime().toString().slice(-4).padStart(4, '0');
      }
    }
    
    // Create a FormData object for file uploads
    const formData = new FormData();
      // Add all regular fields to formData
    Object.keys(orderData).forEach(key => {
      if (key !== 'pictures') {
        // Handle arrays and booleans
        if (Array.isArray(orderData[key])) {
          orderData[key].forEach((item) => formData.append(key, item));
        } else if (typeof orderData[key] === 'boolean') {
          formData.append(key, orderData[key].toString());
        } else if (orderData[key] !== null && orderData[key] !== undefined) {
          formData.append(key, orderData[key]);
        }
      }
    });    // Add pictures if they exist (for file uploads, use "images" as field name for multer)
    if (orderData.pictures && orderData.pictures.length > 0) {
      orderData.pictures.forEach((image, index) => {
        // If it's a File object, add it directly
        if (image instanceof File) {
          formData.append('images', image); // Field name "images" will be handled by multer as defined in routes
        } 
        // If it's a string (URL), we need to handle it differently
        else if (typeof image === 'string') {
          formData.append('existingPictures', image);
        }
      });
    }
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
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
  if (!userId) {
    console.error('Cannot fetch work orders: User ID is undefined');
    return []; // Return empty array instead of throwing to avoid crashes
  }
  
  try {
    console.log('Fetching work orders for user ID:', userId);
    const response = await api.get(`/user/${userId}`, {
      headers: authHeader(),
    });
    console.log('Get work orders by user response:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user work orders:', error.response || error);
    return []; // Return empty array instead of throwing to avoid crashes
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
    console.log('Updating work order with data:', orderData); // Debug log
    
    // Create a FormData object for file uploads
    const formData = new FormData();
      // Add all regular fields to formData
    Object.keys(orderData).forEach(key => {
      if (key !== 'pictures') {
        // Handle arrays and booleans
        if (Array.isArray(orderData[key])) {
          orderData[key].forEach((item) => {
            if (item !== null && item !== undefined) {
              formData.append(key, item);
            }
          });
        } else if (typeof orderData[key] === 'boolean') {
          formData.append(key, orderData[key].toString());
        } else if (orderData[key] !== null && orderData[key] !== undefined) {
          formData.append(key, orderData[key]);
        }
      }
    });
      // Handle pictures
    if (orderData.pictures && orderData.pictures.length > 0) {
      let hasNewImages = false;
      const existingImagePaths = [];
      
      orderData.pictures.forEach((image, index) => {
        // Check if it's a File object (new upload)
        if (image instanceof File) {
          hasNewImages = true;
          formData.append('images', image);
        }
        // If it's a string URL (existing image path)
        else if (typeof image === 'string') {
          existingImagePaths.push(image);
        }
      });
      
      // If we have existing image paths, add them as a JSON string
      if (existingImagePaths.length > 0) {
        formData.append('pictures', JSON.stringify(existingImagePaths));
      }
    }
    
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    
    console.log('Update work order response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error updating work order:', error.response || error); // Debug log
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
    // Clean up empty search params
    const cleanParams = {};
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] && searchParams[key].trim() !== '') {
        cleanParams[key] = searchParams[key];
      }
    });
    
    const response = await api.get('/search', {
      params: cleanParams,
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error searching work orders:', error.response || error);
    throw new Error(error.response?.data?.message || 'Failed to search work orders');
  }
};
