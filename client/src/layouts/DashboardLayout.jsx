import React from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardNavbar from "../components/DashboardNavbar";

const DashboardLayout = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DashboardNavbar />

        <main
          style={{
            padding: "30px",
            flex: 1,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;