function MLPredictionAnalytics({ data = {} }) {
  const predictions = data?.predictions ?? [];
  const latest = data?.latestPrediction ?? data?.latest ?? null;

  return (
    <section className="ml-analytics-section">
      <div className="analytics-section-title">
        <div>
          <h2>ML Prediction Analytics</h2>
          <p>Recent model predictions and risk scoring activity.</p>
        </div>
        <span
          className={`ml-status ${data?.available === false ? "is-unavailable" : "is-available"}`}
        >
          {data?.available === false ? "Model unavailable" : "Model available"}
        </span>
      </div>

      {!data || (predictions.length === 0 && !latest) ? (
        <div className="ml-empty-state">
          No ML prediction data available yet.
        </div>
      ) : (
        <>
          <div className="ml-analytics-meta">
            <span>
              Total predictions: <strong>{predictions.length || 0}</strong>
            </span>
            <span>
              Latest model: <strong>{data?.modelVersion || "baseline"}</strong>
            </span>
          </div>

          <div className="ml-stats-grid">
            <div>
              <span className="ml-stat-label">Low Risk</span>
              <strong>{data?.lowRisk ?? 0}</strong>
            </div>
            <div>
              <span className="ml-stat-label">Medium Risk</span>
              <strong>{data?.mediumRisk ?? 0}</strong>
            </div>
            <div>
              <span className="ml-stat-label">High Risk</span>
              <strong>{data?.highRisk ?? 0}</strong>
            </div>
            <div>
              <span className="ml-stat-label">Avg Confidence</span>
              <strong>{data?.averageConfidence ?? 0}%</strong>
            </div>
            <div>
              <span className="ml-stat-label">Latest Risk</span>
              <strong>{latest?.predictedRisk || latest?.riskLevel || "N/A"}</strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default MLPredictionAnalytics;
