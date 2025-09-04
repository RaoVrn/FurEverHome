import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
});

// Attach token to every request if logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle network errors
    if (!response) {
      console.error('Network Error:', error);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        original: error
      });
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
      
      case 403:
        // Forbidden - user doesn't have necessary permissions
        console.error('Permission denied:', response.data);
        break;
      
      case 404:
        // Not found
        console.error('Resource not found:', response.data);
        break;
      
      case 500:
        // Server error
        console.error('Server error:', response.data);
        break;
      
      default:
        console.error(`Error ${response.status}:`, response.data);
    }

    return Promise.reject(response.data);
  }
);

// Pet API functions
export const petAPI = {
  // Get all pets with optional filters
  getAllPets: async (filters = {}) => {
    try {
      const response = await API.get('/pets', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific pet by ID
  getPetById: async (id) => {
    try {
      const response = await API.get(`/pets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add a new pet
  addPet: async (petData) => {
    try {
      const response = await API.post('/pets', petData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a pet
  updatePet: async (id, petData) => {
    try {
      const response = await API.put(`/pets/${id}`, petData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a pet
  deletePet: async (id) => {
    try {
      const response = await API.delete(`/pets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle like on a pet
  toggleLikePet: async (id) => {
    try {
      const response = await API.post(`/pets/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's posted pets
  getUserPets: async () => {
    try {
      const response = await API.get('/pets/user/posted');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's favorite pets
  getFavoritePets: async () => {
    try {
      const response = await API.get('/pets/user/favorites');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search for pets
  searchPets: async (queryParams) => {
    try {
      const response = await API.get('/pets/search', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Authentication API functions
export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await API.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Upload API functions
export const uploadAPI = {
  // Upload single image
  uploadImage: async (imageFile) => {
    try {
      // Handle both File objects and base64 strings
      let response;
      
      if (imageFile instanceof File) {
        const formData = new FormData();
        formData.append('image', imageFile);
        response = await API.post('/upload/image', formData);
      } else if (typeof imageFile === 'string' && imageFile.startsWith('data:image')) {
        response = await API.post('/upload/image-base64', { image: imageFile });
      } else {
        throw new Error('Invalid image format');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (imageFiles) => {
    try {
      // Handle both File objects and base64 strings
      let response;
      
      if (Array.isArray(imageFiles) && imageFiles.length > 0) {
        if (imageFiles[0] instanceof File) {
          const formData = new FormData();
          imageFiles.forEach(file => formData.append('images', file));
          response = await API.post('/upload/images', formData);
        } else if (typeof imageFiles[0] === 'string') {
          response = await API.post('/upload/images-base64', { images: imageFiles });
        } else {
          throw new Error('Invalid image format');
        }
      } else {
        throw new Error('No images provided');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default API;
