import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../features/auth/authSlice';

const LogoutButton = ({ className = '', variant = 'outline-danger' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the Redux store
    dispatch(logoutAction());
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout}
      className={`btn btn-${variant} ${className}`}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
