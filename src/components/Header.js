import React from "react";
import { List, Bell, Gear } from "react-bootstrap-icons";
import { Dropdown, Badge, Image } from "react-bootstrap";

export default function Header({ title = "Dashboard", onLogout, toggleSidebar }) {
  return (
    <header
      className="app-header d-flex align-items-center px-3 px-md-4 bg-white shadow-sm"
      style={{ minHeight: '60px' }}
    >
      {/* Left Section */}
      <div className="d-flex align-items-center">
        {/* Hamburger for mobile - only visible on mobile */}
        <button 
          className="btn p-0 me-2 d-md-none" 
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <List size={24} className="text-dark" />
        </button>

        {/* Title */}
        <h5 className="mb-0 text-primary fw-bold">{title}</h5>
      </div>

      {/* Right Section - Push to the right */}
      <div className="ms-auto d-flex align-items-center">
        {/* Notification - Hidden on mobile */}
        <div className="position-relative d-none d-md-flex align-items-center me-3" style={{ cursor: "pointer" }}>
          <Bell size={22} />
          <Badge
            bg="danger"
            pill
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              fontSize: "0.6rem",
              minWidth: "16px",
              height: "16px",
              lineHeight: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            3
          </Badge>
        </div>

        {/* Settings - Hidden on mobile */}
        <div className="d-none d-md-flex align-items-center me-3" style={{ cursor: "pointer" }}>
          <Gear size={22} />
        </div>

        {/* Profile */}
        <div className="d-flex align-items-center">
          <Dropdown align="end" className="profile-dropdown">
            <Dropdown.Toggle
              variant="white"
              id="dropdown-profile"
              className="p-0 d-flex align-items-center"
              style={{ border: "none", background: "none" }}
            >
              <Image
                src="https://randomuser.me/api/portraits/men/75.jpg"
                roundedCircle
                width={36}
                height={36}
                alt="Profile"
                style={{ objectFit: "cover" }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-end">
              <Dropdown.Item disabled className="py-2">
                <div className="d-flex flex-column">
                  <strong>John Doe</strong>
                  <small className="text-muted">john.doe@example.com</small>
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={onLogout} className="py-2">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
