import React from "react";
import { Bell, Gear } from "react-bootstrap-icons";
import { Dropdown, Badge, Image } from "react-bootstrap";

export default function Header({ title = "Dashboard", onLogout }) {
  return (
    <header
      className="app-header d-flex justify-content-between align-items-center px-4 bg-white shadow-sm"
    >
      {/* Title */}
      <h5 className="mb-0 text-primary fw-bold">{title}</h5>

      {/* Right section */}
      <div className="d-flex align-items-center gap-4">
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={22} />
          <Badge
            bg="danger"
            pill
            style={{
              position: "absolute",
              top: "-5px",
              right: "-10px",
              fontSize: "0.6rem",
              minWidth: "16px",
              height: "16px",
              lineHeight: "14px",
            }}
          >
            3
          </Badge>
        </div>

        <div style={{ cursor: "pointer" }}>
          <Gear size={22} />
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="white"
            id="dropdown-profile"
            style={{ padding: 0, border: "none", background: "none" }}
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

          <Dropdown.Menu>
            <Dropdown.Item disabled>
              <strong>John Doe</strong>
              <br />
              <small className="text-muted">john.doe@example.com</small>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}
