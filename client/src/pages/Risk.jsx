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
    <section className="mx-auto max-w-3xl">
      <header className="mb-7 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Personal security</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Risk</h1>
        <p className="mt-2 text-slate-600">This score uses the current configurable prototype weighting and is not the final team formula.</p>
      </header>
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-8 text-slate-500">Loading risk assessment...</p> : (
        <>
          <section className="border-b border-slate-200 pb-6">
            <p className="text-sm text-slate-500">Prototype human risk score</p>
            <p className="mt-2 text-5xl font-bold text-slate-900">{assessment?.finalRiskScore == null ? "N/A" : `${assessment.finalRiskScore}%`}</p>
            <p className="mt-2 font-semibold text-slate-700">{assessment?.riskLevel || "Awaiting activity"}</p>
            {!assessment && <p className="mt-3 text-sm text-slate-600">There is not enough recorded quiz, training, or phishing activity to calculate a score yet.</p>}
            <button type="button" onClick={handleCalculate} disabled={calculating} className="mt-5 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
              {calculating ? "Calculating..." : "Recalculate assessment"}
            </button>
          </section>
          {assessment && (
            <section className="mt-6 border-b border-slate-200 pb-6">
              <h2 className="text-lg font-semibold text-slate-900">Contributing factors</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Higher factor scores indicate stronger awareness. Available factors are weighted at 40% training, 35% latest quiz, and 25% phishing activity; missing factors are excluded and the remaining weights are normalized. Risk is 100 minus the resulting awareness score.</p>
              <div className="mt-4 divide-y divide-slate-200">
                {[
                  ["Training completion", assessment.trainingScore],
                  ["Latest quiz", assessment.quizScore],
                  ["Phishing awareness and simulation", assessment.phishingScore],
                  ["Combined security awareness", assessment.securityAwarenessScore],
                ].map(([label, score]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-700">{label}</span>
                    <span className="text-sm font-semibold text-slate-900">{score == null ? "No activity" : `${score}%`}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Prototype scoring only. It is not a validated prediction and should be interpreted alongside the underlying activity.</p>
            </section>
          )}
          <section className="mt-6 border-b border-slate-200 pb-6">
            <h2 className="text-lg font-semibold text-slate-900">AI risk-support prediction</h2>
            {prediction ? (
              <>
                <p className="mt-2 text-slate-600">Model estimate: {prediction.predictedRisk} risk, {Math.round(prediction.confidence * 100)}% confidence.</p>
                <p className="mt-1 text-sm text-slate-500">Model: {prediction.modelVersion}. This is decision support, not a definitive assessment.</p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">No validated model prediction is available. Predictions require a model trained on sufficient real employee data with independent labels; synthetic model outputs are not used.</p>
            )}
          </section>
          <p className="mt-5 text-sm text-slate-600">Review your <Link to="/my/recommendations" className="font-semibold text-blue-700 underline">personal recommendations</Link> for suggested next steps.</p>
        </>
      )}
    </section>
  );
};

export default Risk;
