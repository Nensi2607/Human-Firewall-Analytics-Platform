const DashboardCard = ({ title, value, accent = "#2563EB", subtitle = "" }) => {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div>
          <p className="metric-card-label">{title}</p>
          <h3 className="metric-card-value">{value}</h3>
        </div>
        <span className="metric-card-dot" style={{ background: accent }}></span>
      </div>
      {subtitle && <p className="metric-card-subtitle">{subtitle}</p>}
    </div>
  );
};

export default DashboardCard;