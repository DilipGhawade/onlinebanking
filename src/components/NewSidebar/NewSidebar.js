import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import { FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiOutlineLogout } from 'react-icons/hi';
import { menuItems } from '../../constants/menuItems';
import './NewSidebar.css';

const NewSidebar = ({ onLogout, isCollapsed, onToggleCollapse, onMenuItemClick }) => {
  // isCollapsed and onToggleCollapse are now passed as props
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isHovering, setIsHovering] = useState(false);
  const [clickedMenuItem, setClickedMenuItem] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle mouse enter/leave for the sidebar
  const handleMouseEnter = () => {
    setIsHovering(true);
    setClickedMenuItem(false);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (clickedMenuItem && !isMobile) {
      onToggleCollapse?.(true);
    }
    setClickedMenuItem(false);
  };

  const handleMenuItemClick = (e, item) => {
    e.preventDefault();
    
    // Call the parent's menu item click handler if provided
    if (onMenuItemClick) {
      onMenuItemClick();
    }
    
    // Handle navigation
    if (isMobile) {
      closeMobileMenu();
    } else if (isCollapsed) {
      onToggleCollapse?.(false);
    } else if (window.innerWidth >= 1200) {
      setClickedMenuItem(true);
    }
    
    // Navigate to the selected route
    navigate(`/dashboard/${item.path}`);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1200; // Match the CSS breakpoint
      setIsMobile(isMobileView);
      
      if (isMobileView) {
        setIsOpen(false);
      } else {
        // On desktop, ensure it's open when resizing from mobile
        if (isCollapsed && isMobile) {
          onToggleCollapse?.(false);
        }
        setIsOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener with debounce
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [isCollapsed, isMobile]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      onToggleCollapse?.(!isCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActive = (path) => {
    // Get the current path and remove any leading/trailing slashes
    const currentPath = location.pathname.replace(/^\/|\/$/g, '');
    // Get the last segment of the current path
    const currentSegment = currentPath.split('/').pop() || '';
    
    // Check if the current segment matches the target path
    return currentSegment === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className={`mobile-menu-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleMobileMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <FaBars />
      </button>

      {/* Overlay */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}
        aria-label="Main navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">
              <Icons.FaPiggyBank />
            </span>
            <h2 style={{ color: 'blue' }}>Apana Bank</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => {
              const Icon = Icons[item.icon] || Icons.FaCircle;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isMobile) {
                        closeMobileMenu();
                      } else if (isCollapsed) {
                        // If sidebar is collapsed, expand it first
                        onToggleCollapse?.(false);
                      } else if (window.innerWidth >= 992) {
                        // On desktop, set flag to collapse on mouse leave
                        setClickedMenuItem(true);
                      }
                      // Use React Router's navigate for SPA navigation
                      navigate(`/dashboard/${item.path}`);
                    }}
                  >
                    <span className="nav-icon"><Icon /></span><span className="nav-text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-button" 
            onClick={(e) => {
              e.preventDefault();
              if (onLogout) onLogout();
            }}
          >
            <HiOutlineLogout className="logout-icon" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default NewSidebar;
