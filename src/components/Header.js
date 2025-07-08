import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { 
  HiOutlineBell, 
  HiOutlineMenu, 
  HiX,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronDown
} from 'react-icons/hi';

const Header = ({ 
  user, 
  activeMenu, 
  onLogout, 
  isMobile, 
  isSidebarCollapsed, 
  isSidebarOpen, 
  onToggleSidebar, 
  style 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileState, setIsMobile] = useState(window.innerWidth < 992);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = user && typeof user === 'string' ? JSON.parse(user) : user;

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 992;
      setIsMobile(isMobileView);
      
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

  const toggleMobileMenu = (e) => {
    console.log('Hamburger clicked');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      
      // Prevent any parent click handlers
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    
    // Call the parent toggle handler
    if (onToggleSidebar) {
      onToggleSidebar(e);
    }
  };

  // Merge default styles with any provided styles
  const headerStyle = {
    width: '100%',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'fixed',
    top: 0,
    left: isMobile ? 0 : (isSidebarCollapsed ? '70px' : '250px'),
    right: 0,
    zIndex: 900,
    transition: 'left 0.3s ease',
    ...style // Spread any additional styles passed from parent
  };

  return (
    <header 
      className="app-header" 
      style={headerStyle}
    >
      <div className="container-fluid h-100">
        <div className="header-content h-100 d-flex align-items-center justify-content-between px-4">
          <div className="header-left d-flex align-items-center" style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
            {isMobile && (
              <div className="hamburger-container" style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                  id="hamburger-button"
                  className="hamburger-button d-lg-none btn btn-icon btn-active-color-primary w-30px h-30px me-2" 
                  onClick={toggleMobileMenu}
                  aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                  style={{
                    position: 'relative',
                    zIndex: 1001,
                    border: 'none',
                    background: 'transparent',
                    padding: '8px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {isSidebarOpen ? (
                    <HiX size={24} style={{ color: '#1e1e2d' }} />
                  ) : (
                    <HiOutlineMenu size={24} style={{ color: '#1e1e2d' }} />
                  )}
                </button>
              </div>
            )}
            <div style={{ 
              flex: '1 1 auto',
              minWidth: 0,
              padding: '0 1rem',
              maxWidth: 'calc(100vw - 300px)', // Adjust based on your layout
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1
            }}>
              <h1 
                className="page-title mb-0 fw-semibold" 
                style={{ 
                  color: '#1e1e2d',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  margin: 0,
                  fontSize: '1.25rem',
                  lineHeight: '1.2',
                  padding: '0.5rem 0',
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }}
                title={activeMenu || 'Dashboard'}
              >
                {activeMenu || 'Dashboard'}
              </h1>
            </div>
          </div>
          
          <div className="header-right d-flex align-items-center">
            <div className="notifications me-3" ref={notificationsRef}>
              <button 
                className="btn btn-link position-relative p-2"
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-expanded={showNotifications}
                style={{
                  color: '#5e6278',
                  transition: 'all 0.2s ease',
                  borderRadius: '0.475rem',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <HiOutlineBell size={20} />
                <span 
                  className="position-absolute top-0 end-0 translate-middle badge rounded-circle bg-danger" 
                  style={{
                    width: '8px',
                    height: '8px',
                    padding: 0,
                    border: '2px solid #fff',
                    minWidth: '8px',
                    fontSize: '0'
                  }}
                >
                  <span className="visually-hidden">Unread notifications</span>
                </span>
              </button>
              
              {showNotifications && (
                <div 
                  className="dropdown-menu dropdown-menu-end shadow show" 
                  style={{
                    width: '325px',
                    maxWidth: '90vw',
                    border: '0',
                    borderRadius: '0.475rem',
                    boxShadow: '0 0 50px 0 rgba(82, 63, 105, 0.15)',
                    padding: '0',
                    overflow: 'hidden',
                    marginTop: '0.5rem'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center p-5 pb-3">
                    <h6 className="mb-0 fw-bold" style={{ color: '#181c32' }}>Notifications</h6>
                    <button 
                      className="btn btn-sm btn-link p-0 text-decoration-none"
                      onClick={() => setShowNotifications(false)}
                      style={{
                        color: '#b5b5c3',
                        transition: 'all 0.2s ease',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.475rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f8fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <HiX size={18} />
                    </button>
                  </div>
                  
                  <div 
                    className="dropdown-notifications-list" 
                    style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      padding: '0 1rem 1rem'
                    }}
                  >
                    {[1, 2, 3].map((item) => (
                      <div 
                        key={item} 
                        className="d-flex p-3 mb-2"
                        style={{
                          borderRadius: '0.475rem',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f8fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="flex-shrink-0 me-3">
                          <div 
                            className="bg-primary bg-opacity-10 rounded p-2" 
                            style={{
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <HiOutlineBell size={18} className="text-primary" />
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 
                            className="mb-1" 
                            style={{ 
                              color: '#181c32',
                              fontSize: '0.925rem',
                              fontWeight: '500'
                            }}
                          >
                            Notification {item}
                          </h6>
                          <p 
                            className="mb-1" 
                            style={{
                              color: '#7e8299',
                              fontSize: '0.85rem',
                              lineHeight: '1.5'
                            }}
                          >
                            This is a sample notification message.
                          </p>
                          <div 
                            className="text-muted small" 
                            style={{ 
                              color: '#b5b5c3', 
                              fontSize: '0.75rem' 
                            }}
                          >
                            2 hours ago
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    className="dropdown-footer text-center p-3 border-top" 
                    style={{ borderColor: '#eff2f5' }}
                  >
                    <a 
                      href="/notifications" 
                      className="text-primary text-decoration-none fw-semibold"
                      style={{
                        fontSize: '0.925rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="profile-menu d-flex align-items-center" ref={profileMenuRef}>
              <button 
                className="btn btn-link p-0 d-flex align-items-center"
                onClick={toggleProfileMenu}
                aria-label="User menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.475rem'
                }}
              >
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                  style={{
                    width: '28px',
                    height: '28px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span 
                  className="ms-2 me-1 d-none d-md-inline" 
                  style={{ 
                    color: '#5e6278', 
                    fontSize: '0.925rem' 
                  }}
                >
                  {userData?.name || 'User'}
                </span>
                <HiOutlineChevronDown 
                  size={16} 
                  className="d-none d-md-inline" 
                  style={{ color: '#b5b5c3' }} 
                />
              </button>
              
              {showProfileMenu && (
                <div 
                  className="dropdown-menu dropdown-menu-end shadow show" 
                  style={{
                    minWidth: '250px',
                    border: '0',
                    borderRadius: '0.475rem',
                    boxShadow: '0 0 50px 0 rgba(82, 63, 105, 0.15)',
                    padding: '1rem 0',
                    marginTop: '0.5rem'
                  }}
                >
                  <div className="px-5 py-3">
                    <div 
                      className="fw-bold" 
                      style={{ color: '#181c32' }}
                    >
                      {userData?.name || 'User'}
                    </div>
                    <div className="text-muted small">
                      {userData?.email || ''}
                    </div>
                  </div>
                  
                  <div 
                    className="dropdown-divider my-2" 
                    style={{ borderTopColor: '#e4e6ef' }}
                  />
                  
                  <Link 
                    to="/profile" 
                    className="dropdown-item d-flex align-items-center px-5 py-2"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      color: '#5e6278',
                      transition: 'all 0.2s ease',
                      fontSize: '0.925rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f8fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <HiOutlineUser className="me-3" size={18} style={{ color: '#7e8299' }} />
                    My Profile
                  </Link>
                  
                  <Link 
                    to="/settings" 
                    className="dropdown-item d-flex align-items-center px-5 py-2"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      color: '#5e6278',
                      transition: 'all 0.2s ease',
                      fontSize: '0.925rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f8fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <HiOutlineCog className="me-3" size={18} style={{ color: '#7e8299' }} />
                    Settings
                  </Link>
                  
                  <div 
                    className="dropdown-divider my-2" 
                    style={{ borderTopColor: '#e4e6ef' }}
                  />
                  
                  <button 
                    className="dropdown-item d-flex align-items-center px-5 py-2"
                    onClick={handleLogout}
                    style={{
                      color: '#f64e60',
                      transition: 'all 0.2s ease',
                      fontSize: '0.925rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <HiOutlineLogout className="me-3" size={18} />
                    Sign Out
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
