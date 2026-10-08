import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  calculateRiskAssessment,
  getRiskAssessment,
} from "../services/riskAssessmentService";

const Risk = () => {
  const [assessment, setAssessment] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  const loadRisk = async () => {
    try {
      const response = await getRiskAssessment();
      setAssessment(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your risk assessment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadRisk);
  }, []);

  const handleCalculate = async () => {
    setCalculating(true);
    setError("");
    try {
      const response = await calculateRiskAssessment();
      setAssessment(response.data);
      setPrediction(response.prediction || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to calculate your risk assessment.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <section className="employee-dashboard-shell risk-page-shell">
      <header className="employee-dashboard-intro risk-page-header">
        <div>
          <p className="section-kicker">Personal security</p>
          <h1 className="risk-page-title">My Risk</h1>
        </div>
      </header>

      <p className="employee-dashboard-copy">
        This score uses the current configurable prototype weighting and is not the final team formula.
      </p>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="state-card">
          <p className="dashboard-state">Loading risk assessment...</p>
        </div>
      ) : (
        <>
          <section className="state-card risk-overview-card">
            <div className="risk-summary-row">
              <div>
                <p className="risk-score-label">Prototype human risk score</p>
                <p className="risk-score-value">{assessment?.finalRiskScore == null ? "N/A" : `${assessment.finalRiskScore}%`}</p>
              </div>
              <span className="security-status-pill risk-level-pill">{assessment?.riskLevel || "Awaiting activity"}</span>
            </div>

            {!assessment && (
              <p className="risk-note">There is not enough recorded quiz, training, or phishing activity to calculate a score yet.</p>
            )}

            <button
              type="button"
              onClick={handleCalculate}
              disabled={calculating}
              className="retry-button risk-action-button"
            >
              {calculating ? "Calculating..." : "Recalculate assessment"}
            </button>
          </section>

          {assessment && (
            <section className="state-card risk-page-section">
              <h2 className="panel-title">Contributing factors</h2>
              <p className="risk-description">
                Higher factor scores indicate stronger awareness. Available factors are weighted at 40% training,
                35% latest quiz, and 25% phishing activity; missing factors are excluded and the remaining weights
                are normalized. Risk is 100 minus the resulting awareness score.
              </p>

              <div className="risk-factor-list">
                {[
                  ["Training completion", assessment.trainingScore],
                  ["Latest quiz", assessment.quizScore],
                  ["Phishing awareness and simulation", assessment.phishingScore],
                  ["Combined security awareness", assessment.securityAwarenessScore],
                ].map(([label, score]) => (
                  <div key={label} className="risk-factor-row">
                    <span>{label}</span>
                    <strong>{score == null ? "No activity" : `${score}%`}</strong>
                  </div>
                ))}
              </div>

              <p className="risk-footnote">
                Prototype scoring only. It is not a validated prediction and should be interpreted alongside the
                underlying activity.
              </p>
            </section>
          )}

          <section className="state-card risk-page-section">
            <h2 className="panel-title">AI risk-support prediction</h2>
            {prediction ? (
              <>
                <p className="risk-description">
                  Model estimate: {prediction.predictedRisk} risk, {Math.round(prediction.confidence * 100)}%
                  confidence.
                </p>
                <p className="risk-footnote">Model: {prediction.modelVersion}. This is decision support, not a definitive assessment.</p>
              </>
            ) : (
              <p className="risk-description">
                No validated model prediction is available. Predictions require a model trained on sufficient real
                employee data with independent labels; synthetic model outputs are not used.
              </p>
            )}
          </section>

          <p className="risk-footer-copy">
            Review your <Link to="/my/recommendations" className="auth-link">personal recommendations</Link> for suggested next steps.
          </p>
        </>
      )}
    </section>
  );
};

export default Risk;
