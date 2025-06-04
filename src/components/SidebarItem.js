import React from "react";
import { NavLink } from "react-router-dom";

function SidebarItem({ label, icon, isActive, onClick, to }) {
  return (
    <li className="nav-item mb-2">
      <NavLink
        to={to}
        onClick={onClick}
        className={`nav-link d-flex align-items-center px-2 py-2 rounded ${
          isActive ? "bg-primary text-white fw-semibold" : "text-dark"
        }`}
        style={{ gap: "0.75rem" }}
      >
        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
        {label}
      </NavLink>
    </li>
  );
}

export default SidebarItem;
