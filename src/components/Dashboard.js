import React, { useEffect, useState } from "react";
import { List } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

import Sidebar from "./sidebar";
import Header from "./Header";

import { DashboardPage } from "./DashboardPage";
import TransactionsPage from "./TransactionsPage";
import AccountsPage from "./AccountsPage";
import { InvestmentsPage } from "./InvestmentsPage";
import { CreditCardsPage } from "./CreditCardsPage";
import { LoansPage } from "./LoansPage";
import ServicesPage from "./ServicesPage";
import { SettingPage } from "./SettingPage";
import "./Dashboard.css";
function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let currentPath = location.pathname.replace("/dashboard", "");
    if (currentPath === "" || currentPath === "/") {
      setActive("Dashboard");
      return;
    }
    if (currentPath.startsWith("/")) currentPath = currentPath.substring(1);
    const matchedLabel = currentPath
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    setActive(matchedLabel);
  }, [location.pathname]);

  const handleSelect = (label, path) => {
    if (label === "Logout") {
      dispatch(logout());
      navigate("/", { replace: true });
      return;
    }
    setActive(label);
    let navPath = path;
    if (navPath === "/dashboard") navPath = "";
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
         
        {/* Desktop Header */}
        <Header
          title={active}
          onLogout={() => handleSelect("Logout", "/logout")}
          toggleSidebar={toggleSidebar}
        //  className="d-none d-md-block"
        />

        {/* Main content */}
        <main key={location.pathname} className="main-content flex-grow-1">
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
