const DashboardCard = ({ title, value, accent = "#2563EB", subtitle = "" }) => {
  return (
    <div className="metric-card" style={{ borderTopColor: accent }}>
      <div className="metric-card-top">
        <div>
          <p className="metric-card-label">{title}</p>
          <h3 className="metric-card-value" style={{ color: accent }}>{value}</h3>
        </div>
        <span className="metric-card-dot" style={{ background: accent }}></span>
      </div>
      {subtitle && <p className="metric-card-subtitle">{subtitle}</p>}
    </div>
  );
};

export default DashboardCard;