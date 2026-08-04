const DashboardCard = ({ title, value, color }) => {
  return (
    <div
      style={{
        background: "#fff",
        borderLeft: `6px solid ${color}`,
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h4
        style={{
          color: "#6B7280",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>

      <h1
        style={{
          margin: 0,
          color: color,
        }}
      >
        {value}
      </h1>
    </div>
  );
};

export default DashboardCard;