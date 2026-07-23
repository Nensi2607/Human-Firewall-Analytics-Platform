import React from "react";

const DashboardNavbar = () => {
  return (
    <div
      style={{
        height: "70px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          margin: 0,
          color: "#2563eb",
        }}
      >
        Human Firewall Analytics Platform
      </h2>

      <div
        style={{
          fontWeight: "600",
          color: "#374151",
        }}
      >
        Admin
      </div>
    </div>
  );
};

export default DashboardNavbar;