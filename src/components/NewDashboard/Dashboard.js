import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobile);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const menuItem = menuItems.find(item => item.path === path);
    return menuItem ? menuItem.label : 'Dashboard';
  };

  // Handle window resize and cleanup
  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 1200;
      setIsMobile(isNowMobile);
      
      if (isNowMobile) {
        // On mobile, ensure sidebar is collapsed and closed by default
        setIsSidebarCollapsed(true);
        if (!isMobileMenuOpen) {
          document.body.classList.remove('sidebar-open');
        }
      } else {
        // On desktop, ensure sidebar is expanded and open
        setIsSidebarCollapsed(false);
        setIsMobileMenuOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobileMenuOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle the mobile menu
      const newState = !isMobileMenuOpen;
      setIsMobileMenuOpen(newState);
      document.body.classList.toggle('sidebar-open', newState);
    } else {
      // On desktop, toggle the collapsed state
      const newState = !isSidebarCollapsed;
      setIsSidebarCollapsed(newState);
    }
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <NewSidebar 
        isOpen={isSidebarOpen} 
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onMenuItemClick={handleMenuItemClick}
      />
      
      <main className="main-content">
        <header className="top-header">
          <div className="header-content">
            <div className="header-left">
              <div className="menu-toggle-container">
                <button 
                  className={`menu-toggle ${isMobile ? (isSidebarOpen ? 'active' : '') : (isSidebarCollapsed ? 'collapsed' : 'expanded')}`}
                  onClick={() => {
                    if (isMobile) {
                      setIsSidebarOpen(!isSidebarOpen);
                    } else {
                      setIsSidebarCollapsed(!isSidebarCollapsed);
                    }
                  }}
                  aria-label={isMobile ? 
                    (isSidebarOpen ? 'Close menu' : 'Open menu') : 
                    (isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
                  }
                  data-tooltip={isMobile ? 
                    (isSidebarOpen ? 'Close menu' : 'Open menu') : 
                    (isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
                  }
                >
                  {isMobile ? (
                    isSidebarOpen ? <FaTimes /> : <FaBars />
                  ) : (
                    isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />
                  )}
                </button>
              </div>
              <h1 style={{ paddingLeft: '50px' }}>{getPageTitle()}</h1>
            </div>
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
