function formatConfidence(value) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "N/A";
}

function MLPredictionAnalytics({ data = {} }) {
  const modelStatus = data.modelStatus || {};
  const latestPredictions = data.latestPredictions || [];
  const hasPredictions = data.totalPredictions > 0;

  return (
    <section className="ml-analytics-section">
      <div className="analytics-section-title">
        <div>
          <h2>ML Prediction Analytics</h2>
          <p>Predictions stored from the independently trained risk model.</p>
        </div>
        <span className={`ml-status ${modelStatus.available ? "is-available" : "is-unavailable"}`}>
          <span className="status-dot"></span>
          {modelStatus.available ? "Model available" : "Model unavailable"}
        </span>
      </div>

      <div className="ml-analytics-meta">
        <span>Model version</span>
        <strong>{modelStatus.modelVersion || "Unavailable"}</strong>
      </div>

      {!hasPredictions ? (
        <div className="ml-empty-state">No ML predictions available</div>
      ) : (
        <>
          <div className="ml-stats-grid">
            <div><span>Total ML predictions</span><strong>{data.totalPredictions}</strong></div>
            <div><span>Low predictions</span><strong>{data.lowPredictions}</strong></div>
            <div><span>Medium predictions</span><strong>{data.mediumPredictions}</strong></div>
            <div><span>High predictions</span><strong>{data.highPredictions}</strong></div>
            <div><span>Average confidence</span><strong>{formatConfidence(data.averageConfidence)}</strong></div>
          </div>

          <div className="ml-latest-wrapper">
            <h3>Latest ML predictions</h3>
            <div className="ml-table-wrapper">
              <table className="ml-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Risk</th>
                    <th>Confidence</th>
                    <th>Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPredictions.map((prediction) => (
                    <tr key={`${prediction.userId}-${prediction.generatedAt}`}>
                      <td>{prediction.employeeName || prediction.userId}</td>
                      <td>{prediction.predictedRisk}</td>
                      <td>{formatConfidence(prediction.confidence)}</td>
                      <td>{prediction.generatedAt ? new Date(prediction.generatedAt).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default MLPredictionAnalytics;