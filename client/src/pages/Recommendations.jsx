import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  dismissAdminRecommendation,
  getAdminRecommendations,
  getMyRecommendations,
} from "../services/recommendationService";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Recommendations = () => {
  const isAdmin = getStoredUser()?.role === "admin";
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dismissingId, setDismissingId] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const response = isAdmin
          ? await getAdminRecommendations()
          : await getMyRecommendations();
        setRecommendations(response.data || []);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load recommendations.");
      } finally {
        setLoading(false);
      }
    };
    void Promise.resolve().then(loadRecommendations);
  }, [isAdmin]);

  const handleDismiss = async (recommendationId) => {
    setDismissingId(recommendationId);
    try {
      await dismissAdminRecommendation(recommendationId);
      setRecommendations((current) => current.filter((recommendation) => recommendation._id !== recommendationId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to dismiss recommendation.");
    } finally {
      setDismissingId(null);
    }
  };

  return (
    <section className="employee-dashboard-shell recommendations-page-shell">
      <header className="employee-dashboard-intro recommendations-page-header">
        <div>
          <p className="section-kicker">Security guidance</p>
          <h1>{isAdmin ? "Organization Recommendations" : "Your Recommendations"}</h1>
        </div>
      </header>

      <p className="employee-dashboard-copy">
        {isAdmin
          ? "Prioritized follow-ups for employees and departments, based on recorded security activity."
          : "Personalized next steps based only on your assigned learning and recorded activity."}
      </p>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="state-card">
          <p className="dashboard-state">Loading recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="state-card">
          <p className="dashboard-state">{isAdmin ? "No current admin recommendations." : "You're all caught up."}</p>
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
                      <span className={`recommendation-priority recommendation-priority-${recommendation.priority || "normal"}`}>{recommendation.priority || "normal"}</span>
                    </div>
                    {isAdmin && (
                      <p className="recommendation-employee">
                        {employee && typeof employee === "object"
                          ? `For ${employee.firstName} ${employee.lastName} (${employee.email})`
                          : `Department: ${recommendation.departmentName || "Unassigned"}`}
                      </p>
                    )}
                    <p className="recommendation-description">{recommendation.description}</p>
                    {recommendation.reason && <p className="recommendation-description"><strong>Reason:</strong> {recommendation.reason}</p>}
                    {recommendation.suggestedAction && <p className="recommendation-description"><strong>Suggested action:</strong> {recommendation.suggestedAction}</p>}
                    {recommendation.dueDate && <p className="recommendation-description">Deadline: {new Date(recommendation.dueDate).toLocaleString()}</p>}
                  </div>

                  <div className="recommendation-actions">
                    {recommendation.actionUrl && (
                      <Link to={recommendation.actionUrl} className="recommendation-action-link">
                        {recommendation.actionLabel || "Open"}
                      </Link>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={dismissingId === recommendation._id}
                        onClick={() => handleDismiss(recommendation._id)}
                        className="recommendation-action-button"
                      >
                        {dismissingId === recommendation._id ? "Dismissing..." : "Dismiss"}
                      </button>
                    )}
                  </div>
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
