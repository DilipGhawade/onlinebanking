import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage if available
const loadInitialState = () => {
  try {
    const user = localStorage.getItem('user');
    return {
      user: user ? JSON.parse(user) : null,
      isAuthenticated: !!user,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    };
  }
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      
      // Save user to localStorage
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Failed to save user to localStorage', error);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;
