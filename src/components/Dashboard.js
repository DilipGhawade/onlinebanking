import React, { useEffect, useState } from "react";
import { List, Bell, Gear } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

import Sidebar from "./sidebar";
import Header from "./Header";

import { DashboardPage } from "./DashboardPage";
import { TransactionsPage } from "./TransactionsPage";
import { AccountsPage } from "./AccountsPage";
import { InvestmentsPage } from "./InvestmentsPage";
import { CreditCardsPage } from "./CreditCardsPage";
import { LoansPage } from "./LoansPage";
import { ServicesPage } from "./ServicesPage";
import { SettingPage } from "./SettingPage";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath =
    location.pathname.replace("/dashboard/", "") || "dashboard";

  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let currentPath = location.pathname.replace("/dashboard", "");
    if (currentPath === "" || currentPath === "/") {
      setActive("Dashboard");
      return;
    }
    // Remove leading slash
    if (currentPath.startsWith("/")) currentPath = currentPath.substring(1);
    const matchedLabel = currentPath
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    setActive(matchedLabel);
  }, [location.pathname]);

  // const handleSelect = (label) => {
  //   if (label === "Logout") {
  //     dispatch(logout());
  //     navigate("/", { replace: true });
  //     return;
  //   }
  //   setActive(label);
  //   const path = label.toLowerCase().replace(/\s+/g, "-");
  //   navigate(`/dashboard/${path}`);
  // };
  const handleSelect = (label, path) => {
    console.log("Sidebar clicked label:", label, "path:", path);
    if (label === "Logout") {
      dispatch(logout());
      navigate("/", { replace: true });
      return;
    }
    setActive(label);
    // Remove leading slash from path for dashboard root
    let navPath = path;
    if (navPath === "/dashboard") navPath = "";
    // Ensure correct navigation
    navigate(`/dashboard${navPath}`);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar
        active={active}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Right side: header + main */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100">
        {/* Header (mobile & desktop) */}
        <div className="mobile-header-layout d-md-none bg-white border-bottom p-2 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button className="btn" onClick={toggleSidebar}>
              <List />
            </button>
            <img 
              src="/images/banklogo.svg" 
              alt="BankDash Logo" 
              style={{ height: '32px', marginLeft: '10px' }} 
            />
            <h5 className="text-primary fw-bold ms-3 mb-0 d-inline">{active}</h5>
          </div>
          
          <div className="d-flex align-items-center">
            {/* Notification Icon with Badge */}
            <div className="position-relative me-3" style={{ cursor: 'pointer' }}>
              <Bell size={22} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                3
                <span className="visually-hidden">unread notifications</span>
              </span>
            </div>
            
            {/* Settings Icon */}
            <div className="me-3" style={{ cursor: 'pointer' }}>
              <Gear size={22} />
            </div>
            
            {/* Profile Dropdown */}
            <div className="dropdown">
              <button 
                className="btn p-0" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <img 
                  src="https://randomuser.me/api/portraits/men/75.jpg" 
                  className="rounded-circle border border-light" 
                  alt="Profile" 
                  width="36" 
                  height="36"
                  style={{ objectFit: 'cover' }}
                />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item" onClick={() => handleSelect("Logout", "/logout")}>Logout</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Keep the existing Header for desktop */}
        <Header
          title={active}
          onLogout={() => handleSelect("Logout", "/logout")}
          toggleSidebar={toggleSidebar}
          className="d-none d-md-block"
        />

        <main
          key={location.pathname}
          className="main-content flex-grow-1"
        >
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="investments" element={<InvestmentsPage />} />
            <Route path="credit-cards" element={<CreditCardsPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="setting" element={<SettingPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
export default Dashboard;
