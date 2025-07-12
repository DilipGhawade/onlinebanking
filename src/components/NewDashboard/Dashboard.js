import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import NewSidebar from '../NewSidebar/NewSidebar';
import { menuItems } from '../../constants/menuItems';
import '../NewDashboard/Dashboard.css';

// Import pages
import DashboardPage from '../DashboardPage';
import TransactionsPage from '../TransactionsPage';
import AccountsPage from '../AccountsPage';
import CreditCardsPage from '../CreditCardsPage';
import LoansPage from '../LoansPage';
import SettingPage from '../SettingPage';
import ErrorBoundary from '../ErrorBoundary';
import InvestmentsPage from '../InvestmentsPage';
import ServicesPage from '../ServicesPage';

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const menuItem = menuItems.find(item => item.path === path);
    return menuItem ? menuItem.label : 'Dashboard';
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-container">
      <NewSidebar isOpen={isSidebarOpen} onLogout={handleLogout} />
      
      <main className="main-content">
        <header className="top-header">
          <div className="header-content">
            <h1 style={{ paddingLeft: '50px' }}>{getPageTitle()}</h1>
            <div className="user-actions">
              <button className="notification-btn" aria-label="Notifications">
                <i className="fas fa-bell"></i>
                <span className="badge">3</span>
              </button>
              <div className="user-profile">
                <div className="avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.name || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <ErrorBoundary>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="creditcards" element={<CreditCardsPage />} />
              <Route path="investments" element={<InvestmentsPage />} />
              <Route path="loans" element={<LoansPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="settings" element={<SettingPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default React.memo(Dashboard);
