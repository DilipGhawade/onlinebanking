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
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaCircle
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

const Sidebar = ({ onLogout, onClose, isMobile, activeMenu, setActiveMenu, isCollapsed, setIsCollapsed, onMenuItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Toggle collapsed state
  const toggleCollapse = useCallback((e) => {
    e?.stopPropagation();
    if (!isMobile) {
      setIsCollapsed(prev => !prev);
    }
  }, [isMobile]);

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
    e?.preventDefault();
    e?.stopPropagation();
    
    if (item?.path) {
      if (onMenuItemClick) {
        onMenuItemClick(item.path);
      } else {
        setActiveMenu(item.label);
        navigate(item.path);
      }
      
      // Close sidebar on mobile after navigation
      if (isMobile && onClose) {
        onClose(e);
      }
    }
  }, [navigate, setActiveMenu, isMobile, onClose, onMenuItemClick]);
  
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
  
  // Handle mouse enter/leave for desktop hover effect
  const handleMouseEnter = useCallback((e) => {
    if (!isMobile && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isMobile, isCollapsed, setIsCollapsed]);

  const handleMouseLeave = useCallback((e) => {
    if (!isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile, isCollapsed, setIsCollapsed]);

  // Toggle body class when mobile sidebar opens/closes
  useEffect(() => {
    if (isMobile) {
      if (!isCollapsed) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
      
      // Cleanup on unmount
      return () => {
        document.body.classList.remove('sidebar-open');
      };
    }
  }, [isMobile, isCollapsed]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !onClose) return;
    
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const hamburgerButton = document.querySelector('.hamburger-button');
      
      if (sidebar && !sidebar.contains(e.target) && !hamburgerButton?.contains(e.target)) {
        onClose(e);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, onClose]);

  // Render overlay for mobile
  const renderOverlay = () => {
    if (!isMobile || isCollapsed) return null;
    
    return (
      <div 
        className="sidebar-overlay"
        onClick={onClose}
        role="button"
        aria-label="Close sidebar"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
          opacity: !isCollapsed ? 1 : 0,
          visibility: !isCollapsed ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease'
        }}
      />
    );
  };

  return (
    <>
      {renderOverlay()}
      <div 
        className={`sidebar ${isMobile ? 'mobile' : ''} ${!isCollapsed ? 'open' : 'collapsed'}`}
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <FaWallet className="text-primary" size={24} />
            {(!isMobile && !isCollapsed) && (
              <h5 className="ms-3 mb-0">Online Banking</h5>
            )}
          </div>
          <button 
            className="collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </button>
        </div>
        
        {/* Menu Items */}
        <div className="sidebar-menu mt-4">
          {menuItems.map((item) => {
            const IconComponent = iconComponents[item.icon] || FaCircle;
            return (
              <div 
                key={item.path}
                className={`menu-item ${activeMenu === item.label ? 'active' : ''}`}
                onClick={(e) => handleMenuClick(item, e)}
              >
                <IconComponent className="menu-icon" />
                <span className="menu-item-text">{item.label}</span>
                {item.badge && (
                  <span className="badge bg-primary rounded-pill ms-auto">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Logout Button */}
        <div className="mt-auto">
          <div 
            className="menu-item"
            onClick={handleLogout}
          >
            <HiOutlineLogout className="menu-icon" />
            <span className="menu-item-text">Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
