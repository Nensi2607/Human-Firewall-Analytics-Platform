const iconMap = {
  users: "👥",
  "high-risk": "⚠️",
  "medium-risk": "📊",
  "low-risk": "✅",
  score: "📈",
  phishing: "🎣",
};

function StatisticsCard({ title, value, subtitle, icon }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <p className="analytics-card-label">{title}</p>
          <h3 className="analytics-card-value">{value}</h3>
        </div>
        <div className="analytics-card-icon" aria-hidden="true">
          {iconMap[icon] || "•"}
        </div>
      </div>
      <p className="analytics-card-subtitle">{subtitle}</p>
    </div>
  );
}

export default StatisticsCard;
