import { useEffect, useState } from "react";
import {
  getRecommendations,
  updateRecommendationStatus,
} from "../services/recommendationService";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const statusOptions = ["pending", "in-progress", "completed", "dismissed"];

const Recommendations = () => {
  const isAdmin = getStoredUser()?.role === "admin";
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await getRecommendations();
      setRecommendations(response.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadRecommendations);
  }, []);

  const handleStatusChange = async (recommendationId, status) => {
    setUpdatingId(recommendationId);
    try {
      const response = await updateRecommendationStatus(recommendationId, status);
      setRecommendations((current) => current.map((recommendation) => (
        recommendation._id === recommendationId ? response.data : recommendation
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update recommendation.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="employee-dashboard-shell recommendations-page-shell">
      <header className="employee-dashboard-intro recommendations-page-header">
        <div>
          <p className="section-kicker">Security guidance</p>
        </div>
      </header>

      <p className="employee-dashboard-copy">
        Recommendations are generated from recorded activity, the prototype risk score, and the latest baseline prediction.
      </p>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="state-card">
          <p className="dashboard-state">Loading recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="state-card">
          <p className="dashboard-state">No recommendations have been generated yet.</p>
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((recommendation) => {
            const employee = recommendation.userId;
            return (
              <article key={recommendation._id} className="recommendation-card">
                <div className="recommendation-card-top">
                  <div className="recommendation-copy">
                    <div className="recommendation-card-header">
                      <h2>{recommendation.title}</h2>
                      <span className="recommendation-priority">{recommendation.priority || "normal"}</span>
                    </div>
                    {isAdmin && employee && (
                      <p className="recommendation-employee">For {employee.firstName} {employee.lastName} ({employee.email})</p>
                    )}
                    <p className="recommendation-description">{recommendation.description}</p>
                  </div>

                  <select
                    value={recommendation.status || "pending"}
                    disabled={updatingId === recommendation._id}
                    onChange={(event) => handleStatusChange(recommendation._id, event.target.value)}
                    aria-label={`Status for ${recommendation.title}`}
                    className="recommendation-status-select"
                  >
                    {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Recommendations;
