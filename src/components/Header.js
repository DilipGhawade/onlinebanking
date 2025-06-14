import React from 'react';
import { FiMenu, FiBell, FiSettings, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const userData = user && typeof user === 'string' ? JSON.parse(user) : user;

  return (
    <header className={theme === 'dark' ? 'bg-dark' : 'bg-light'}>
      <div className="header-container">
        {/* Mobile menu button */}
        <button 
          className="btn btn-menu d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <FiMenu size={20} className={theme === 'dark' ? 'text-light' : 'text-dark'} />
        </button>
        
        {/* Page Title - visible on all screens */}
        <div className="ms-2">
          <h5 className="mb-0 fw-bold" style={{ 
            color: theme === 'dark' ? '#fff' : '#000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px'
          }}>
            {(() => {
              const path = location.pathname.split('/').pop();
              if (path === 'dashboard' || path === '') return 'Dashboard';
              return path.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
            })()}
          </h5>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginLeft: 'auto',
          gap: '0.5rem'
        }}>
          {/* Theme Toggle */}
          <button 
            className="btn btn-link p-1 me-2 text-decoration-none"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: 'none',
              background: 'none'
            }}
          >
            {theme === 'light' ? (
              <FiMoon size={20} className="text-dark" />
            ) : (
              <FiSun size={20} className="text-light" />
            )}
          </button>

          {/* Notifications */}
          <div className="position-relative me-2">
            <button 
              className="btn p-1"
              style={{ 
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#fff' : '#000',
                position: 'relative'
              }}
            >
              <FiBell size={20} />
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.6rem' }}
              >
                3
              </span>
            </button>
          </div>

          {/* Settings */}
          <div className="dropdown">
            <button 
              className="btn p-1"
              style={{ 
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#fff' : '#000'
              }}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FiSettings size={20} />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Settings</a></li>
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><LogoutButton /></li>
            </ul>
          </div>

          {/* User Profile */}
          <div className="dropdown">
            <button 
              className="btn p-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ 
                background: 'none',
                border: 'none',
                padding: '0.25rem',
                borderRadius: '50%'
              }}
            >
              <div
                className="rounded-circle overflow-hidden"
                style={{
                  width: '36px',
                  height: '36px',
                  border: `2px solid ${theme === 'dark' ? '#495057' : '#e9ecef'}`,
                }}
              >
                <img
                  src={userData?.avatar || 'https://via.placeholder.com/36'}
                  alt="Profile"
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/36';
                  }}
                />
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li className="px-3 py-2">
                <h6 className="mb-0">{userData?.name || 'User'}</h6>
                <small className="text-muted">{userData?.email || ''}</small>
              </li>
              <li><hr className="dropdown-divider m-0" /></li>
              <li><a className="dropdown-item" href="#">My Profile</a></li>
              <li><a className="dropdown-item" href="#">Account Settings</a></li>
              <li><hr className="dropdown-divider m-0" /></li>
              <li className="px-2"><LogoutButton className="w-100" /></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
