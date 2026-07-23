import React from "react";

const DashboardCard = ({
  title,
  value,
  icon,
  color = "#2563eb",
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h4
          style={{
            margin: 0,
            color: "#6b7280",
            fontSize: "15px",
          }}
        >
          {title}
        </h4>

        <h2
          style={{
            marginTop: "10px",
            color: "#111827",
          }}
        >
          {value}
        </h2>
      </div>

      <div
        style={{
          fontSize: "35px",
          color,
        }}
      >
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;