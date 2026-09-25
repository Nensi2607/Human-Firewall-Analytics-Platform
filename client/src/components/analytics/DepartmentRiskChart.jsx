function DepartmentRiskChart({ data = [] }) {
  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <h3>Department Risk</h3>
      </div>

      {data.length === 0 ? (
        <p className="analytics-empty">No department risk data available.</p>
      ) : (
        <div className="department-risk-list">
          {data.map((item, index) => {
            const department = item.department || item.name || `Department ${index + 1}`;
            const score = Number(item.riskScore ?? item.score ?? item.averageRisk ?? 0);

            return (
              <div key={department} className="department-risk-row">
                <div className="department-risk-meta">
                  <span>{department}</span>
                  <strong>{score}%</strong>
                </div>
                <div className="risk-chart-bar-track">
                  <div
                    className="risk-chart-bar risk-medium"
                    style={{ width: `${Math.min(score, 100)}%` }}
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

export default DepartmentRiskChart;
