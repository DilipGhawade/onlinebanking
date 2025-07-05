import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { menuItems } from '../constants/menuItems';
import Sidebar from './Sidebar';
import Header from './Header';
import './Dashboard.css';

// Import pages
import DashboardPage from './DashboardPage';
import TransactionsPage from './TransactionsPage';
import AccountsPage from './AccountsPage';
import CreditCardsPage from './CreditCardsPage';
import LoansPage from './LoansPage';
import SettingPage from './SettingPage';
import ErrorBoundary from './ErrorBoundary';
import InvestmentsPage from './InvestmentsPage';
import ServicesPage from './ServicesPage';

// Simple Loading Spinner Component
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth state
  const { user, loading } = useSelector((state) => ({
    user: state.auth?.user,
    loading: state.auth?.loading
  }));
  
  // State declarations
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(!isMobile);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      // If switching to mobile, close the sidebar
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      // If switching to desktop, ensure sidebar is not stuck open
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);
  
  // Toggle body class when mobile sidebar is open
  useEffect(() => {
    if (isMobile) {
      if (isSidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile, isSidebarOpen]);
  
  // Close sidebar on mobile when clicking outside or navigating
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  }, [isMobile]);

  // Toggle sidebar open/closed state
  const toggleSidebar = useCallback(() => {
    console.log('Toggling sidebar', { isMobile, currentIsOpen: isSidebarOpen });
    if (isMobile) {
      const newState = !isSidebarOpen;
      setIsSidebarOpen(newState);
      if (newState) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  }, [isMobile, isSidebarOpen]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  }, [isMobile, isSidebarCollapsed]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
  }, [isMobile, isSidebarCollapsed]);
  
  // Handle logout
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  // Get the current route name based on path
  const getActiveRouteName = useCallback((pathname) => {
    // Find the matching menu item from the menuItems array
    const menuItem = menuItems.find(item => pathname.startsWith(item.path));
    return menuItem ? menuItem.label : 'Dashboard';
  }, []);
  
  // Set active menu based on current route
  useEffect(() => {
    const routeName = getActiveRouteName(location.pathname);
    console.log('Setting active menu:', { path: location.pathname, routeName });
    setActiveMenu(routeName);
  }, [location.pathname, getActiveRouteName]);
  
  // Handle menu item click
  const handleMenuItemClick = useCallback((path) => {
    navigate(path);
    setActiveMenu(menuItems.find(item => item.path === path)?.label || 'Dashboard');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const headerToggle = document.querySelector('.header-toggle');
      
      if (isSidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target) && 
          !(headerToggle && headerToggle.contains(event.target))) {
        closeSidebar();
      }
    };

    // Add both mousedown and touchstart for better mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, closeSidebar, isSidebarOpen]);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [location.pathname, isMobile, closeSidebar]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      const wasMobile = isMobile;
      
      if (mobile !== wasMobile) {
        console.log(`Window resized. Mobile: ${mobile}, wasMobile: ${wasMobile}`);
        setIsMobile(mobile);
        
        if (mobile) {
          // Switching to mobile - close sidebar
          console.log('Switching to mobile view - closing sidebar');
          setIsSidebarOpen(false);
        } else {
          // Switching to desktop - ensure sidebar is in collapsed state
          console.log('Switching to desktop view - collapsing sidebar');
          setIsSidebarCollapsed(true);
          setIsSidebarOpen(false);
        }
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If no user is logged in, don't render the dashboard
  if (!user) {
    return null; // The auth flow will handle the redirect
  }

  // Sidebar style based on state
  const sidebarStyle = {
    width: isMobile ? '250px' : (isSidebarCollapsed ? '70px' : '250px'),
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: isMobile ? (isSidebarOpen ? '0' : '-250px') : '0',
    zIndex: 1002, // Higher than header to stay on top
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#1e1e2d',
    boxShadow: isMobile && isSidebarOpen ? '8px 0 15px 0 rgba(0,0,0,0.1)' : 'none',
    overflowY: 'auto',
    padding: '1rem 0',
    color: '#9899ac',
    display: 'block',
    visibility: 'visible',
    opacity: 1,
    transform: 'translateX(0)',
    overflowX: 'hidden' // Prevent horizontal scrollbar
  };
  
  // Sidebar width
  const sidebarWidth = isMobile ? '250px' : (isSidebarCollapsed ? '70px' : '250px');
  
  // Header style - positioned to the right of the sidebar
  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: isMobile ? '0' : sidebarWidth,
    right: 0,
    height: '70px',
    zIndex: 1001, // Below sidebar but above content
    transition: isMobile ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    margin: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    width: isMobile ? '100%' : `calc(100% - ${isSidebarCollapsed ? '70px' : '250px'})`,
    marginLeft: '0' // Ensure no extra margin on the left
  };
  
  // Main content style - positioned below header and to the right of sidebar
  const mainContentStyle = {
    position: 'absolute',
    left: isMobile ? '0' : (isSidebarCollapsed ? '70px' : '250px'),
    right: '0',
    top: '70px',
    bottom: '0',
    padding: '1rem',
    backgroundColor: '#f5f7fa',
    transition: isMobile ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowX: 'hidden',
    overflowY: 'auto',
    boxSizing: 'border-box',
    margin: 0
  };

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh',
      position: 'relative',
      width: '100%',
      overflowX: 'hidden',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Sidebar */}
      <aside 
        className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
        style={sidebarStyle}
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      >
        <Sidebar 
          onLogout={handleLogout}
          onClose={closeSidebar}
          isMobile={isMobile}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onMenuItemClick={handleMenuItemClick}
        />
      </aside>
      
      {/* Header - positioned to the right of sidebar */}
      <div style={headerStyle}>
        <Header 
          user={user} 
          activeMenu={activeMenu}
          onLogout={handleLogout}
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
      </div>
      
      {/* Main content wrapper */}
      <div style={{
        ...mainContentStyle,
        padding: '1.5rem',
        paddingBottom: '20px',
        minHeight: 'calc(100vh - 70px)'
      }}>
        {/* <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
        }}> */}
          {/* Page content */}
          <div style={{
            width: '100%',
            maxWidth: '100%',
            margin: 0,
            padding: '1.5rem'
          }}>
            <ErrorBoundary>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route 
                  path="dashboard" 
                  element={
                    <DashboardPage onNavigate={() => setActiveMenu('Dashboard')} />
                  } 
                />
                <Route 
                  path="transactions" 
                  element={
                    <TransactionsPage onNavigate={() => setActiveMenu('Transactions')} />
                  } 
                />
                <Route 
                  path="accounts" 
                  element={
                    <AccountsPage onNavigate={() => setActiveMenu('Accounts')} />
                  } 
                />
                <Route 
                  path="creditcards" 
                  element={
                    <CreditCardsPage onNavigate={() => setActiveMenu('Credit Cards')} />
                  } 
                />
                <Route 
                  path="loans" 
                  element={
                    <LoansPage onNavigate={() => setActiveMenu('Loans')} />
                  } 
                />
                <Route 
                  path="services" 
                  element={
                    <ServicesPage onNavigate={() => setActiveMenu('Services')} />
                  } 
                />
                <Route 
                  path="investments" 
                  element={
                    <InvestmentsPage onNavigate={() => setActiveMenu('Investments')} />
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <SettingPage onNavigate={() => setActiveMenu('Settings')} />
                  } 
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>
        {/* </div> */}
      </div>
    </div>
  );
}

export default React.memo(Dashboard);
