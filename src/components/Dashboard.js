import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { menuItems } from '../constants/menuItems';
import Sidebar from './sidebar';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      // Reset sidebar state when switching between mobile and desktop
      if (mobile) {
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      } else {
        setIsSidebarOpen(true);
        document.body.classList.add('sidebar-open');
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    };
  }, []);
  
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
        document.body.style.overflow = 'hidden';
      } else {
        document.body.classList.remove('sidebar-open');
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);
  
  // Close sidebar on mobile when clicking outside or navigating
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
      
      // Force remove any lingering overlay
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    } else {
      // On desktop, just collapse the sidebar
      setIsSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Toggle sidebar open/closed state
  const toggleSidebar = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isMobile) {
      const newState = !isSidebarOpen;
      setIsSidebarOpen(newState);
      
      // Toggle body class and scroll lock for mobile
      if (newState) {
        document.body.classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
      } else {
        document.body.classList.remove('sidebar-open');
        document.body.style.overflow = '';
      }
    } else {
      // Toggle collapsed state for desktop
      const newCollapsedState = !isSidebarCollapsed;
      setIsSidebarCollapsed(newCollapsedState);
      
      // Update body class for desktop
      if (newCollapsedState) {
        document.body.classList.remove('sidebar-open');
      } else {
        document.body.classList.add('sidebar-open');
      }
    }
  }, [isMobile, isSidebarOpen, isSidebarCollapsed]);

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
  
  // Handle menu item clicks
  const handleMenuItemClick = useCallback((path) => {
    const menuItem = menuItems.find(item => item.path === path);
    if (menuItem) {
      setActiveMenu(menuItem.label);
      
      // Navigate first
      navigate(path);
      
      // Then close sidebar if on mobile
      if (isMobile) {
        // Small timeout to ensure navigation starts before closing
        setTimeout(() => {
          closeSidebar();
        }, 50);
      }
    }
  }, [isMobile, navigate, closeSidebar]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const hamburgerButton = document.getElementById('hamburger-button');
      
      // Check if the click is outside both sidebar and hamburger button
      const isClickOutside = sidebar && !sidebar.contains(event.target);
      const isClickOnHamburger = hamburgerButton && hamburgerButton.contains(event.target);
      
      if (isClickOutside && !isClickOnHamburger) {
        console.log('Click outside detected, closing sidebar');
        closeSidebar();
      }
    };
    
    // Use a small timeout to ensure this runs after the click that opened the sidebar
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isMobile, isSidebarOpen, closeSidebar]);
  
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

  // Calculate sidebar width based on collapsed state
  const sidebarWidth = isSidebarCollapsed ? 70 : 250;
  
  return (
    <div className={`app-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`} style={{
      display: 'flex',
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#f8f9fa',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      paddingLeft: isMobile ? 0 : `${sidebarWidth}px`,
      transition: 'padding-left 0.3s ease',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Sidebar Overlay - Only shown on mobile */}
      {isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            opacity: isSidebarOpen ? 1 : 0,
            visibility: isSidebarOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease',
            pointerEvents: isSidebarOpen ? 'auto' : 'none'
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${sidebarWidth}px`,
          zIndex: 1000,
          transition: isMobile ? 'transform 0.3s ease' : 'all 0.3s ease',
          transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onClose={closeSidebar}
          onLogout={handleLogout}
        />
      </div>
      
      <div className="main-content-wrapper" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        transition: isMobile ? 'transform 0.3s ease' : 'padding 0.3s ease',
        transform: isMobile && isSidebarOpen ? 'translateX(250px)' : 'none',
        padding: isMobile ? '90px 20px 20px 20px' : '90px 20px 20px 20px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        marginTop: 0,
        maxWidth: '100%',
        overflowY: 'auto',
        height: '100vh',
        marginLeft: isMobile ? 0 : `-${sidebarWidth}px`,
        paddingLeft: isMobile ? '20px' : `calc(20px + ${sidebarWidth}px)`
      }}>
        {/* Header - fixed at the top */}
        <Header 
          onClose={closeSidebar}
          isMobile={isMobile}
          activeMenu={activeMenu}
          isCollapsed={isSidebarCollapsed}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
          style={{
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : `${sidebarWidth}px`,
            right: 0,
            height: '70px',
            backgroundColor: '#fff',
            zIndex: 900,
            transition: 'left 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        />
        
        {/* Main content area */}
        <div style={{
          padding: '20px',
          paddingTop: '90px', // Space for the fixed header
          flex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 800
        }}>
        <ErrorBoundary>
          <Routes>
            <Route 
              path="/" 
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
              path="credit-cards" 
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
      </div>
    </div>
  );
}

export default React.memo(Dashboard);
