const Navbar = () => {
  return (
    <header
      style={{
        height: "70px",
        background: "#FFFFFF",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Left Section */}
      <div>
        <h2
          style={{
            margin: 0,
            color: "#1F2937",
          }}
        >
          Human Firewall Analytics Platform
        </h2>

        <small
          style={{
            color: "#6B7280",
          }}
        >
          Cyber Security Awareness Dashboard
        </small>
      </div>

      {/* Right Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          🔔
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#2563EB",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            A
          </div>

          <div>
            <div style={{ fontWeight: "bold" }}>
              Admin
            </div>

            <small style={{ color: "#6B7280" }}>
              System Administrator
            </small>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;