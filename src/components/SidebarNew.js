import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
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
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { HiOutlineLogout } from 'react-icons/hi';
import { menuItems } from '../constants/menuItems';
import './Sidebar.css';
import './MobileSidebar.css';

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

const Sidebar = ({ onLogout, isMobile, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // In mobile view, we always want the sidebar to be collapsed (icons only)
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!item?.path) return;
    
    // Update the active menu
    setActiveMenu(item.label);
    
    // Navigate to the selected path
    navigate(item.path);
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setIsOpen(false);
      document.body.style.overflow = '';
    } else {
      // Collapse sidebar on desktop
      setIsCollapsed(true);
    }
  }, [navigate, setActiveMenu, isMobile]);
  
  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    document.body.style.overflow = newIsOpen ? 'hidden' : '';
  }, [isOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isOpen && !e.target.closest('.sidebar-wrapper')) {
        setIsOpen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Mobile menu button
  const mobileMenuButton = isMobile && (
    <button 
      className="mobile-menu-toggle"
      onClick={toggleMobileMenu}
      aria-label="Toggle menu"
    >
      {isOpen ? <FaTimes /> : <FaBars />}
    </button>
  );

  // Handle logout
  const handleLogoutClick = useCallback((e) => {
    e.preventDefault();
    if (isMobile) {
      setIsOpen(false);
      document.body.style.overflow = '';
    }
    onLogout();
  }, [isMobile, onLogout]);

  return (
    <>
      {isMobile && mobileMenuButton}
      
      <div 
        className={`sidebar-wrapper ${isMobile ? 'mobile' : ''} ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar">
          {isMobile && (
            <div className="mobile-sidebar-header">
              <h3>Menu</h3>
              <button 
                className="close-sidebar" 
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>
          )}
          
          {!isMobile && (
            <div className="sidebar-header">
              {!isCollapsed && <h1>Menu</h1>}
              <button 
                className="collapse-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
              >
                {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
            </div>
          )}
          
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = iconComponents[item.icon] || FaWallet;
              const isActive = activeMenu === item.label;
              
              return (
                <li key={item.path} className={isActive ? 'active' : ''}>
                  <a
                    href={item.path}
                    onClick={(e) => handleMenuClick(item, e)}
                    className={isActive ? 'active' : ''}
                  >
                    <span className="menu-item-icon">
                      <Icon />
                    </span>
                    {(!isCollapsed || isMobile) && (
                      <span className="menu-item-text">{item.label}</span>
                    )}
                  </a>
                </li>
              );
            })}
            
            <li className="logout-item">
              <a 
                href="#" 
                onClick={handleLogoutClick}
              >
                <span className="menu-item-icon">
                  <HiOutlineLogout />
                </span>
                {(!isCollapsed || isMobile) && (
                  <span className="menu-item-text">Logout</span>
                )}
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={toggleMobileMenu} />
      )}
    </>
  );
};

Sidebar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  activeMenu: PropTypes.string.isRequired,
  setActiveMenu: PropTypes.func.isRequired,
};

export default Sidebar;
