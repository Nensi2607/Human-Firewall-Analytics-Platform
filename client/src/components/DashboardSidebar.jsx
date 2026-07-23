import React from "react";
import { Link } from "react-router-dom";

const DashboardSidebar = () => {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#1e3a8a",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>HFAP</h2>

      <hr />

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <Link
          to="/admin"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>

        <Link
          to="/users"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          Users
        </Link>

        <Link
          to="/departments"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          Departments
        </Link>

        <Link
          to="/reports"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          Reports
        </Link>
      </nav>
    </div>
  );
};

export default DashboardSidebar;