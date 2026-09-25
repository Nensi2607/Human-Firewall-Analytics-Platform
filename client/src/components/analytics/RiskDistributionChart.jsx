function RiskDistributionChart({ data = [] }) {
  const total = data.reduce((sum, item) => {
    const count = Number(item.count ?? item.value ?? 0);
    return sum + count;
  }, 0) || 1;

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <h3>Risk Distribution</h3>
      </div>

      {data.length === 0 ? (
        <p className="analytics-empty">No risk distribution data available.</p>
      ) : (
        <div className="risk-chart-list">
          {data.map((item) => {
            const label = item.label || item.riskLevel || "Unknown";
            const value = Number(item.count ?? item.value ?? 0);
            const percentage = Math.round((value / total) * 100);

            return (
              <div key={label} className="risk-chart-row">
                <div className="risk-chart-meta">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="risk-chart-bar-track">
                  <div
                    className={`risk-chart-bar risk-${String(label).toLowerCase()}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RiskDistributionChart;
