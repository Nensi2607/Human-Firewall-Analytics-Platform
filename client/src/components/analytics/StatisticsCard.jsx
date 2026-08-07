function StatisticsCard({ title, value, subtitle, icon }) {
  return (
    <div className="analytics-stat-card">
      <div className="analytics-stat-icon">
        {icon}
      </div>

      <div className="analytics-stat-content">
        <p className="analytics-stat-title">
          {title}
        </p>

        <h2 className="analytics-stat-value">
          {value}
        </h2>

        {subtitle && (
          <p className="analytics-stat-subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatisticsCard;