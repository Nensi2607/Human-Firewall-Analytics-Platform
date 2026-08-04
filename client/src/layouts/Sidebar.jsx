import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside
      style={{
        width: "250px",
        height: "100vh",
        background: "#1F2937",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        HFAP
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            color: isActive ? "#38BDF8" : "#fff",
            textDecoration: "none",
            fontSize: "18px",
          })}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/employees"
          style={({ isActive }) => ({
            color: isActive ? "#38BDF8" : "#fff",
            textDecoration: "none",
            fontSize: "18px",
          })}
        >
          Employees
        </NavLink>

        <NavLink
          to="/phishing"
          style={({ isActive }) => ({
            color: isActive ? "#38BDF8" : "#fff",
            textDecoration: "none",
            fontSize: "18px",
          })}
        >
          Phishing
        </NavLink>

        <NavLink
          to="/training"
          style={({ isActive }) => ({
            color: isActive ? "#38BDF8" : "#fff",
            textDecoration: "none",
            fontSize: "18px",
          })}
        >
          Training
        </NavLink>

        <NavLink
          to="/reports"
          style={({ isActive }) => ({
            color: isActive ? "#38BDF8" : "#fff",
            textDecoration: "none",
            fontSize: "18px",
          })}
        >
          Reports
        </NavLink>

        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            color: isActive ? "#38BDF8" : "#fff",
            textDecoration: "none",
            fontSize: "18px",
          })}
        >
          Settings
        </NavLink>
      </nav>

      {/* Logout */}
      <button
        style={{
          marginTop: "auto",
          padding: "10px",
          background: "#EF4444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;