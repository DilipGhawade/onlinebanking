import axios from 'axios';
// Import user data directly from db.json
import userData from '../db.json';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  // Login with email and password
  login: (email, password) => {
    try {
      // Find user by email in the local data
      const user = userData.users.find(user => user.email === email);
      
      if (user) {
        // Verify password (in a real app, you would hash the password)
        if (user.password === password) {
          // Remove password from user data before returning
          const { password: _, ...userData } = user;
          return { success: true, user: userData };
        }
      }
      
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }
};

export const userAPI = {
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

export const accountsAPI = {
  getUserAccounts: (userId) => 
    api.get('/users', {
      params: { id: userId }
    }).then(res => res.data[0]?.accounts || []),
  
  updateAccount: (userId, accountId, data) => 
    api.get(`/users/${userId}`)
      .then(res => {
        const user = res.data;
        const updatedAccounts = user.accounts.map(acc => 
          acc.id === accountId ? { ...acc, ...data } : acc
        );
        return api.patch(`/users/${userId}`, { accounts: updatedAccounts });
      })
};

export const transactionsAPI = {
  getUserTransactions: (userId) => 
    api.get('/users', {
      params: { id: userId }
    }).then(res => res.data[0]?.transactions || []),
  
  addTransaction: (userId, transaction) => 
    api.get(`/users/${userId}`)
      .then(res => {
        const user = res.data;
        const newTransaction = {
          ...transaction,
          id: Date.now(), // Simple ID generation
          date: new Date().toISOString().split('T')[0] // Current date
        };
        const updatedTransactions = [newTransaction, ...(user.transactions || [])];
        return api.patch(`/users/${userId}`, { transactions: updatedTransactions });
      })
};

export default api;
