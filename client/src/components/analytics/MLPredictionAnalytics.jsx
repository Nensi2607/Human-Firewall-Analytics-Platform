function MLPredictionAnalytics({ data = {} }) {
  const predictions = data?.latestPredictions ?? [];
  const modelStatus = data?.modelStatus ?? {};
  const pending = !modelStatus?.available || predictions.length === 0;

  return (
    <section className="ml-analytics-section">
      <div className="analytics-section-title">
        <div>
          <h2>AI Prediction Results</h2>
          <p>Recent model predictions and risk scoring activity.</p>
        </div>
        <span className={`ml-status ${pending ? "is-unavailable" : "is-available"}`}>
          {pending ? "Pending AI module" : "Model available"}
        </span>
      </div>

      {pending ? (
        <div className="ml-empty-state">
          Pending AI module — no live prediction data is available yet.
        </div>
      ) : (
        <>
          <div className="ml-analytics-meta">
            <span>
              Total predictions: <strong>{data?.totalPredictions ?? 0}</strong>
            </span>
            <span>
              Latest model: <strong>{modelStatus?.modelVersion ?? "unknown"}</strong>
            </span>
          </div>

          <div className="ml-stats-grid">
            <div>
              <span className="ml-stat-label">Low Risk</span>
              <strong>{data?.lowPredictions ?? 0}</strong>
            </div>
            <div>
              <span className="ml-stat-label">Medium Risk</span>
              <strong>{data?.mediumPredictions ?? 0}</strong>
            </div>
            <div>
              <span className="ml-stat-label">High Risk</span>
              <strong>{data?.highPredictions ?? 0}</strong>
            </div>
            <div>
              <span className="ml-stat-label">Avg Confidence</span>
              <strong>{data?.averageConfidence ?? 0}%</strong>
            </div>
            <div>
              <span className="ml-stat-label">Latest Risk</span>
              <strong>{predictions[0]?.predictedRisk ?? "N/A"}</strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default MLPredictionAnalytics;
