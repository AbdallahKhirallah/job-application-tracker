// ====================================
// API SERVICE
// =====================================
//This file handles all communication with the backend API

// Base URL for backend API
const API_URL = 'http://localhost:5001/api';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Getting the auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};


// Saving the auth token to localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Removing the auth token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Saving user data to localStorage
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Getting user data from localStorage
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};



// Removing user data from localStorage
const removeUser = () => {
  localStorage.removeItem('user');
};



// ============================================
// API REQUEST HELPER
// ============================================

// Generic function to make API requests (to handle adding the auth token automatically)
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,

  };

  // Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,

      headers,
    });

    const data = await response.json();

    // If response isn't ok , throw an error
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:' , error);

    throw error;
  }
};

// ====================================
// AUTHENTICATION API 
// ====================================

export const authAPI = {
  // Registering a new user
  register: async (name, email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    // saving token and user to localStorage
    setToken(data.token);
    setUser(data.user);

    return data;
  },

  // Login existing user
    login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Saving token and user to localStorage
    setToken(data.token);
    setUser(data.user);

    return data;

  },

  // Logout user
  logout: () => {
    removeToken() ;
    removeUser();
  },


  // Checking if user is logged in
  isLoggedIn: () => {
    return !!getToken();
  },

  // Getting current user from localStorage
  getCurrentUser: () => {
    return getUser();

  },
};

