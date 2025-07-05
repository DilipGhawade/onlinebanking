import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { 
  HiOutlineBell, 
  HiOutlineMenu, 
  HiOutlineX,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronDown
} from 'react-icons/hi';

const Header = ({ onToggleSidebar, isSidebarOpen, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 992;
      setIsMobile(isMobileView);
      
      // Close dropdowns when switching to mobile
      if (isMobileView && (showNotifications || showProfileMenu)) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showNotifications, showProfileMenu]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close dropdowns when navigating
  useEffect(() => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const userData = user && typeof user === 'string' ? JSON.parse(user) : user;

  return (
    <header className="app-header bg-white shadow-sm">
      <div className="container-fluid h-100">
        <div className="header-content h-100 d-flex align-items-center justify-content-between px-3">
          <div className="header-left d-flex align-items-center">
            <button 
              className="menu-toggle btn btn-link text-dark p-2 me-2" 
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
            </button>
            <h1 className="page-title mb-0 fs-5 fw-bold d-none d-md-block">
              <Link to="/dashboard" className="text-decoration-none text-dark">
                Online Banking
              </Link>
            </h1>
          </div>
          
          <div className="header-right d-flex align-items-center">
            <div className="notifications me-2 me-lg-3" ref={notificationsRef}>
              <button 
                className="btn btn-link text-dark position-relative p-2"
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <HiOutlineBell size={20} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3<span className="visually-hidden">unread notifications</span>
                </span>
              </button>
              
              {showNotifications && (
                <div className="dropdown-menu dropdown-menu-end shadow show" style={{ width: '320px', maxWidth: '90vw' }}>
                  <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h6 className="mb-0 fw-bold">Notifications</h6>
                    <button 
                      className="btn btn-sm btn-link p-0 text-decoration-none"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Link to="/notifications/1" className="dropdown-item d-flex align-items-start p-3 border-bottom" onClick={() => setShowNotifications(false)}>
                      <div className="flex-shrink-0 me-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                          <HiOutlineBell className="text-primary" />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1">Your account has been updated successfully</p>
                        <small className="text-muted">2 hours ago</small>
                      </div>
                    </Link>
                    <Link to="/notifications/2" className="dropdown-item d-flex align-items-start p-3 border-bottom" onClick={() => setShowNotifications(false)}>
                      <div className="flex-shrink-0 me-3">
                        <div className="bg-warning bg-opacity-10 p-2 rounded">
                          <HiOutlineBell className="text-warning" />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1">New login detected from a new device</p>
                        <small className="text-muted">1 day ago</small>
                      </div>
                    </Link>
                  </div>
                  <div className="text-center p-2 border-top">
                    <Link to="/notifications" className="btn btn-link text-decoration-none" onClick={() => setShowNotifications(false)}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="user-menu" ref={profileMenuRef}>
              <button 
                className="btn btn-link text-dark text-decoration-none d-flex align-items-center p-2"
                onClick={toggleProfileMenu}
                aria-expanded={showProfileMenu}
                aria-label="User menu"
              >
                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  {userData?.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name || 'User'} 
                      width="36"
                      height="36"
                      className="rounded-circle"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-primary fw-bold">
                      {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <span className="ms-2 d-none d-lg-inline">
                  {userData?.name || 'User'}
                </span>
                <HiOutlineChevronDown className={`ms-1 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showProfileMenu && (
                <div className="dropdown-menu dropdown-menu-end shadow show" style={{ minWidth: '200px' }}>
                  <div className="dropdown-header">
                    <h6 className="mb-0">{userData?.name || 'User'}</h6>
                    <small className="text-muted">{userData?.email || 'user@example.com'}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to="/profile" 
                    className="dropdown-item d-flex align-items-center" 
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <HiOutlineUser className="me-2" />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <HiOutlineCog className="me-2" />
                    <span>Settings</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item d-flex align-items-center text-danger"
                    onClick={handleLogout}
                  >
                    <HiOutlineLogout className="me-2" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
