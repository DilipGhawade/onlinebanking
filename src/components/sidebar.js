import React from "react";
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
} from "react-bootstrap-icons";
import SidebarItem from "./SidebarItem";
import "../styles/Dashboard.css";

const menuItems = [
  { label: "Dashboard", icon: <House />, path: "/dashboard" },
  { label: "Transactions", icon: <Repeat />, path: "/transactions" },
  { label: "Accounts", icon: <Person />, path: "/accounts" },
  { label: "Investments", icon: <Layers />, path: "/investments" },
  { label: "Credit Cards", icon: <CreditCard />, path: "/credit-cards" },
  { label: "Loans", icon: <GraphUp />, path: "/loans" },
  { label: "Services", icon: <LifePreserver />, path: "/services" },
  { label: "Setting", icon: <Gear />, path: "/setting" },
  { label: "Logout", icon: <BoxArrowRight />, path: "/logout" },
];

function Sidebar({ active, onSelect, isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay on mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={toggleSidebar}
      ></div>

      <aside
        className={`sidebar-container d-flex flex-column p-3 ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center" style={{ gap: '10px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="#1e3c72"/>
              <text 
                x="50%" 
                y="50%" 
                fill="white" 
                fontSize="14" 
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                AB
              </text>
            </svg>
            <h4 className="text-primary fw-bold mb-0">Apna Bank</h4>
          </div>
        </div>

        <ul className="nav flex-column">
          {menuItems.map(({ label, icon, path }) => (
            <SidebarItem
              key={label}
              label={label}
              icon={icon}
              isActive={active === label}
              to={`/dashboard${path === '/dashboard' ? '' : path}`}
              onClick={(e) => {
                // Prevent default for Logout to avoid navigation
                if (label === 'Logout') {
                  e.preventDefault();
                }
                onSelect(label, path);
                toggleSidebar(); // auto close on mobile
              }}
            />
          ))}
        </ul>
      </aside>
    </>
  );
}

export default Sidebar;
