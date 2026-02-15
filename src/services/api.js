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

// A generic function to make API requests (to handle adding the auth token automatically)
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();


    // Client side Token expiry check 
  if (token) {
    try {

      // Decoding JWT payload to extract expiration time
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenPayload.exp * 1000; // exp is in seconds, convert to ms
      
      // if token expired, logout user and refresh page
      if (Date.now() >= expiryTime) {
        removeToken();
        removeUser();
        window.location.reload();
        return;
      }

    } catch (e) {
      // Token malformed , clear auth data
      removeToken();
      removeUser();
      window.location.reload();
      return;
    }
  }

  
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

  // Changing password for logged user
changePassword: async (currentPassword, newPassword) => {

  const data = await apiRequest('/auth/change-password', {
    method: 'PUT',        
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return data;
},

};



// ============================================
// APPLICATIONS API
// ============================================

export const applicationsAPI = {



  // ********** GET ALL APPLICATIONS ***********

  // Fetches all job applications for the logged-in user
  getAll: async () => {
    try {
      // GET request to /api/applications
      const data = await apiRequest('/applications', {
        method: 'GET',
      });

      // Returns the applications array from the response (data.applications)
      return data.applications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },


  // ********* GET A SINGLE APPLICATION BY ID ************

  // Fetches a specific application by its ID
  getById: async (id) => {
    try {
      const data = await apiRequest(`/applications/${id}`, {
        method: 'GET',
      });

      return data.application;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;

    }
  },


  // *************** CREATE NEW APPLICATION *****************

  // Creates a new job application
  // const newApp = await applicationsAPI.create({
  //   company: "Google",
  //   role: "Software Engineer",
  //   status: "applied",
  //   location: "Joliette, MTL",
  //   applied_at:  "2024-02-06",
  //   source: "LinkedIn",
  //   notes: "Referred by Sam "

  // });
  
  create: async (applicationData) => {
    try {
      // applicationData should be an object with:
      // - company  (required)
      // - role (required)
      // - status (optional , defaults : "applied")
      // - location (optional)
      // - applied_at (optional, date string)
      // - source  (optional)
      // - notes (optional)
      
      const data = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });


      return data.application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },




  // ***************** UPDATE APPLICATION ********************
  // Updates an existing application

 
  // const updated = await applicationsAPI.update(5, {
  //   status: "interview" ,
  //   notes: "Phone screen scheduled for next week"
  // } );
  
  update: async (id, applicationData) => {
    try {
      // applicationData can include any fields you want to update without need to update all fields
      // COALESCE is used to keep old values for fields not included in backend
      
      const data = await apiRequest(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(applicationData),
      });


      return data.application;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },


  // ***************** DELETE APPLICATION **********************

  // Deletes an application
  delete: async (id) => {
    try {
      const data = await apiRequest(`/applications/${id}`, {
        method: 'DELETE',

      });

      return data.deletedApplication;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;

    }
  },

 
  // ***************** GET STATISTICS *****************

  // Gets statistics about applications 
  // ex returns: { total: 10 , byStatus : { applied : 5, interview : 3, offer: 1, rejected: 1 } }
  
  getStats: async () => {
    try {
      const data = await apiRequest('/applications/stats/summary', {
        method: 'GET',
      });

      return data.stats;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
      
    }
  },
};

