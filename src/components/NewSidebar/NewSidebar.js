import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import { FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiOutlineLogout } from 'react-icons/hi';
import { menuItems } from '../../constants/menuItems';
import './NewSidebar.css';

const NewSidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
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
        className="mobile-menu-button" 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
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
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <h2 className={isCollapsed ? 'hidden' : ''}>BankApp</h2>
          <button 
            className="collapse-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
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
                      }
                      // Use React Router's navigate for SPA navigation
                      navigate(`/dashboard/${item.path}`);
                    }}
                  >
                    <span className="nav-icon"><Icon /></span>
                    <span className="nav-text">{item.label}</span>
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
