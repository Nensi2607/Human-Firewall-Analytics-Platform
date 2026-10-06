function MLPredictionAnalytics({ data = {} }) {
  const predictions = data?.latestPredictions ?? [];
  const modelStatus = data?.modelStatus ?? {};
  const pending = !modelStatus?.available || predictions.length === 0;

  return (
    <section className="ml-analytics-section">
      <div className="analytics-section-title">
        <div>
          <h2>AI Prediction Results</h2>
          <p>Model outputs are decision support, not definitive risk assessments.</p>
        </div>
        <span className={`ml-status ${pending ? "is-unavailable" : "is-available"}`}>
          {!modelStatus?.available ? "Model unavailable" : predictions.length === 0 ? "No predictions yet" : "Model available"}
        </span>
      </div>

      {!modelStatus?.available ? (
        <div className="ml-empty-state">
          {modelStatus?.message || "No validated model is available. Real employee data and independent labels are required; synthetic model outputs are not used."}
        </div>
      ) : predictions.length === 0 ? (
        <div className="ml-empty-state">The model is available, but no saved predictions match the current filters.</div>
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
