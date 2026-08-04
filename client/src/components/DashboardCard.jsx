const DashboardCard = ({ title, value }) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h3
        style={{
          color: "#6B7280",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color: "#2563EB",
          margin: 0,
        }}
      >
        {value}
      </h1>
    </div>
  );
};

export default DashboardCard;