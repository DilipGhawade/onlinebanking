import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome,
  FaExchangeAlt,
  FaWallet,
  FaChartLine,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaPiggyBank,
  FaCog
} from 'react-icons/fa';
import { HiOutlineLogout } from 'react-icons/hi';
import { menuItems } from '../constants/menuItems';
import './Sidebar.css';

// Map icon names to their corresponding components
const iconComponents = {
  FaHome,
  FaExchangeAlt,
  FaWallet,
  FaChartLine,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaPiggyBank,
  FaCog
};

const Sidebar = ({ onLogout, onClose, isMobile, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Update active menu based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    if (activeItem) {
      setActiveMenu(activeItem.label);
    }
  }, [location.pathname, setActiveMenu]);
  
  // Handle menu item click
  const handleMenuClick = useCallback((item, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.path) {
      // Update the active menu in the parent component
      setActiveMenu(item.label);
      
      // Navigate to the selected path
      navigate(item.path);
      
      // Close sidebar on mobile after navigation
      if (isMobile) {
        onClose();
      }
    }
  }, [navigate, isMobile, onClose, setActiveMenu]);
  
  // Set active menu based on current route on initial load
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find the matching menu item
    const findActiveMenu = () => {
      // Find the menu item that matches the current path
      const activeItem = menuItems.find(item => item.path === currentPath);
      
      // If found, return its label, otherwise default to 'Dashboard'
      return activeItem ? activeItem.label : 'Dashboard';
    };
    
    // Update the active menu if it's different
    const newActiveMenu = findActiveMenu();
    if (newActiveMenu !== activeMenu) {
      setActiveMenu(newActiveMenu);
    }
  }, [location.pathname, activeMenu, setActiveMenu]);

  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  // Use FaWallet for the logo
  const LogoIcon = FaWallet;
  
  return (
    <div className="sidebar bg-white h-100 d-flex flex-column">
      <div className="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <div className="d-flex align-items-center">
          <FaWallet className="text-primary me-2" style={{ fontSize: '1.75rem' }} />
          <span className="h4 mb-0 fw-bold text-dark">BankApp</span>
        </div>
        {isMobile && (
          <button 
            className="btn btn-link p-0"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="sidebar-body flex-grow-1 overflow-auto py-2">
        <ul className="nav flex-column">
          {menuItems.map((item) => {
            const IconComponent = iconComponents[item.icon] || FaHome;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="nav-item">
                <a
                  href={item.path}
                  className={`nav-link d-flex align-items-center py-2 px-4 mx-2 rounded ${
                    isActive 
                      ? 'bg-primary bg-opacity-10 text-primary fw-semibold' 
                      : 'text-dark hover-bg-light'
                  }`}
                  onClick={(e) => handleMenuClick(item, e)}
                >
                  <IconComponent 
                    className="me-3" 
                    style={{ 
                      width: '20px', 
                      textAlign: 'center',
                      color: isActive ? 'var(--bs-primary)' : 'var(--bs-gray-700)'
                    }} 
                  />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="sidebar-footer p-3 border-top mt-auto">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
        >
          <HiOutlineLogout className="me-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
