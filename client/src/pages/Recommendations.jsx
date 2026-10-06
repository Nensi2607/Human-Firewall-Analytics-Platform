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
    <section className="mx-auto max-w-5xl">
      <header className="mb-7 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Security guidance</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {isAdmin ? "Organization Recommendations" : "My Recommendations"}
        </h1>
        <p className="mt-2 text-slate-600">
          Recommendations are generated from recorded activity, the prototype risk score, and the latest baseline prediction.
        </p>
      </header>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="py-8 text-slate-500">Loading recommendations...</p>
      ) : recommendations.length === 0 ? (
        <p className="py-8 text-slate-500">No recommendations have been generated yet.</p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => {
            const employee = recommendation.userId;
            return (
              <article key={recommendation._id} className="border-b border-slate-200 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{recommendation.title}</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">{recommendation.priority || "normal"}</span>
                    </div>
                    {isAdmin && employee && (
                      <p className="mt-1 text-sm text-slate-500">For {employee.firstName} {employee.lastName} ({employee.email})</p>
                    )}
                    <p className="mt-3 leading-6 text-slate-600">{recommendation.description}</p>
                  </div>
                  <select
                    value={recommendation.status || "pending"}
                    disabled={updatingId === recommendation._id}
                    onChange={(event) => handleStatusChange(recommendation._id, event.target.value)}
                    aria-label={`Status for ${recommendation.title}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
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
