import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  House,
  Repeat,
  Person,
  Layers,
  CreditCard,
  GraphUp,
  LifePreserver,
  Gear,
  BoxArrowRight,
  X,
  List,
} from 'react-bootstrap-icons';
import { Nav } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const menuItems = [
  { label: 'Dashboard', icon: <House />, path: '/dashboard' },
  { label: 'Transactions', icon: <Repeat />, path: '/dashboard/transactions' },
  { label: 'Accounts', icon: <Person />, path: '/dashboard/accounts' },
  { label: 'Investments', icon: <Layers />, path: '/dashboard/investments' },
  { label: 'Credit Cards', icon: <CreditCard />, path: '/dashboard/credit-cards' },
  { label: 'Loans', icon: <GraphUp />, path: '/dashboard/loans' },
  { label: 'Services', icon: <LifePreserver />, path: '/dashboard/services' },
  { label: 'Settings', icon: <Gear />, path: '/dashboard/setting' },
];

function Sidebar({ active, onLogout, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleNavigation = (path, e) => {
    e.preventDefault();
    if (path === '/logout') {
      onLogout();
    } else {
      navigate(path);
      // Close sidebar on mobile after navigation
      if (window.innerWidth < 992) {
        onClose();
      }
    }
  };

  return (
    <div className="h-100 d-flex flex-column" style={{ backgroundColor: theme === 'dark' ? '#212529' : '#fff' }}>
      {/* Logo and Brand */}
      <div className="d-flex align-items-center p-3 border-bottom">
        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
          <div className="d-flex align-items-center justify-content-center rounded" 
               style={{ 
                 width: '32px', 
                 height: '32px', 
                 backgroundColor: '#1e3c72',
                 flexShrink: 0
               }}>
            <span className="text-white fw-bold">
              {process.env.REACT_APP_NAME?.charAt(0) || 'B'}
            </span>
          </div>
          <h5 className="mb-0 fw-bold d-block">Bank Name</h5>
        </div>
        <button 
          className="btn p-0 ms-auto d-lg-none"
          onClick={onClose}
          style={{ 
            border: 'none', 
            background: 'none',
            padding: '0.5rem',
            marginRight: '-0.5rem'
          }}
        >
          <X size={24} className={theme === 'dark' ? 'text-light' : 'text-dark'} />
        </button>
      </div>

      {/* Navigation */}
      <Nav className="flex-column p-2 flex-grow-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Nav.Link
              key={item.path}
              className={`d-flex align-items-center px-3 py-2 mb-1 rounded ${isActive ? 'bg-primary text-white' : 'text-body'}`}
              onClick={(e) => handleNavigation(item.path, e)}
            >
              <span className="me-3">{item.icon}</span>
              <span>{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>

      {/* Logout Button */}
      <div className="p-3 border-top">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
          onClick={onLogout}
        >
          <BoxArrowRight className="me-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
