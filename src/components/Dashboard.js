import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { menuItems } from '../constants/menuItems';
import Sidebar from './Sidebar';
import Header from './Header';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Handle logout
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const newState = !prev;
      if (isMobile) {
        if (newState) {
          document.body.classList.add('sidebar-open');
        } else {
          document.body.classList.remove('sidebar-open');
        }
      }
      return newState;
    });
  }, [isMobile]);

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    document.body.classList.remove('sidebar-open');
  }, []);

  // Handle window resize and set initial state
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 992;
      const wasMobile = isMobile;
      
      if (isMobileView !== wasMobile) {
        setIsMobile(isMobileView);
        
        if (isMobileView) {
          // Switching to mobile view
          document.body.classList.remove('sidebar-open');
          setSidebarOpen(false);
        } else {
          // Switching to desktop view
          document.body.classList.add('sidebar-open');
          setSidebarOpen(true);
        }
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const menuButton = document.querySelector('.menu-toggle');
      
      if (sidebarOpen && 
          sidebar && 
          menuButton &&
          !sidebar.contains(event.target) && 
          !menuButton.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen, closeSidebar]);

  // Update active menu based on route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    if (activeItem) {
      setActiveMenu(activeItem.label);
    }
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If no user is logged in, don't render the dashboard
  if (!user) {
    return null; // Let the useEffect handle the redirect
  }
  
  // Add mobile styles
  const mobileStyles = {
    mainContent: {
      marginLeft: '0',
      width: '100%',
      transition: 'margin-left 0.3s ease-in-out',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    desktopMainContent: {
      marginLeft: sidebarOpen ? '280px' : '0',
      transition: 'margin-left 0.3s ease-in-out',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }
  };

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`} style={{
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'block'
          }}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: '280px',
          height: '100vh',
          background: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          overflowY: 'auto',
          willChange: 'transform'
        }}
      >
        <Sidebar 
          isMobile={isMobile}
          onClose={closeSidebar}
          onLogout={handleLogout}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>
      
      {/* Main content wrapper */}
      <div 
        style={{
          position: 'fixed',
          left: sidebarOpen ? '280px' : '0',
          right: 0,
          top: 0,
          bottom: 0,
          overflowY: 'auto',
          transition: 'left 0.3s ease-in-out'
        }}
      >
        {/* Sticky header */}
        <div 
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Header 
            onToggleSidebar={toggleSidebar} 
            isSidebarOpen={sidebarOpen}
            user={user}
          />
        </div>
        
        {/* Main content */}
        <div className="main-wrapper">
          <main className="main-content">
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
                  path="investments" 
                  element={
                    <InvestmentsPage onNavigate={() => setActiveMenu('Investments')} />
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
                  path="settings" 
                  element={
                    <SettingPage onNavigate={() => setActiveMenu('Settings')} />
                  } 
                />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {/* Toast notifications will be added here */}
      </div>
    </div>
  );
}

export default React.memo(Dashboard);
