import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Container, Overlay } from 'react-bootstrap';

// Import components
import Sidebar from './sidebar';
import Header from './Header';
import { DashboardPage } from './DashboardPage';
import TransactionsPage from './TransactionsPage';
import AccountsPage from './AccountsPage';
import { InvestmentsPage } from './InvestmentsPage';
import { CreditCardsPage } from './CreditCardsPage';
import { LoansPage } from './LoansPage';
import ServicesPage from './ServicesPage';
import { SettingPage } from './SettingPage';

// Import styles
import './Dashboard.css';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useSelector((state) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('Dashboard');
  
  // Close sidebar when clicking on overlay (mobile view)
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname.replace("/dashboard", "");
    if (path === "" || path === "/") {
      setActive("Dashboard");
      return;
    }
    
    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const pageName = pathParts[0].replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
      setActive(pageName);
    }
  }, [location.pathname]);

  // Scroll to top when route changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar active={active} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="d-lg-none"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1039,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        
        {/* Page Content */}
        <Container fluid className="p-3">
          <div style={{ marginTop: '1rem' }}>
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="investments" element={<InvestmentsPage />} />
              <Route path="credit-cards" element={<CreditCardsPage />} />
              <Route path="loans" element={<LoansPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="setting" element={<SettingPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default Dashboard;
