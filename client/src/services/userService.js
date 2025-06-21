import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const updateProfile = async (formData) => {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    // Remove any surrounding quotes from the token
    token = token.replace(/^"|"$/g, '');
    
    const response = await axios.put(`${API_URL}/self`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export { updateProfile }; 