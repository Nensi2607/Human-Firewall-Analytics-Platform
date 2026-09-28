import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SecurityActivityTimeline from "../components/dashboard/SecurityActivityTimeline";
import SecurityProgress from "../components/dashboard/SecurityProgress";

import { getEmployeeDashboard } from "../services/dashboardService";

const OverviewCard = ({ title, value, detail, accent }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className={`mb-4 h-1 w-12 rounded-full ${accent}`} />
    <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{detail}</p>
  </article>
);

const EmployeeDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEmployeeDashboard();
        if (isActive) {
          setDashboard(data.data);
        }
      } catch (err) {
        const status = err.response?.status;

        if (isActive) {
          setDashboard(null);
          setError(
            status === 401 || status === 403
              ? "You are not authorized to view this dashboard."
              : "Unable to load your security dashboard."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((previousCount) => previousCount + 1);
  };

  const completedTrainings = dashboard?.completedTrainings;
  const pendingTrainings = dashboard?.pendingTrainings;
  const quizzesCompleted = dashboard?.quizzesCompleted;
  const latestQuizResult = dashboard?.latestQuizResult;
  const phishingAwareness = dashboard?.phishingAwareness;
  const finalRiskScore = dashboard?.finalRiskScore ?? dashboard?.riskScore;
  const riskLevel = dashboard?.riskLevel;
  const securityAwarenessScore = dashboard?.securityAwarenessScore;
  const trainingTotal =
    typeof completedTrainings === "number" &&
    typeof pendingTrainings === "number"
      ? completedTrainings + pendingTrainings
      : null;
  const trainingDetail =
    trainingTotal && trainingTotal > 0
      ? `${completedTrainings} / ${trainingTotal} completed`
      : "Progress not available yet";

  return (
    <div className="employee-dashboard-shell">
      <section className="employee-dashboard-intro">
        <div>
          <p className="section-kicker">Security Awareness Dashboard</p>
          <h1>
            Welcome{dashboard?.employee?.firstName
              ? `, ${dashboard.employee.firstName}`
              : ""}
          </h1>
        </div>
        <div className="security-status-pill">
          <span className="status-indicator"></span>
          Security readiness
        </div>
      </section>

      <p className="employee-dashboard-copy">
        Build strong security habits by completing your training, quizzes, and
        phishing awareness activities.
      </p>

      {loading ? (
        <h3 className="dashboard-state">Loading your security dashboard...</h3>
      ) : error ? (
        <div className="state-card error-card">
          <h3>{error}</h3>
          <button type="button" onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      ) : !dashboard ? (
        <h3 className="dashboard-state">Unable to load your security dashboard.</h3>
      ) : (
        <>
          <section>
            <h2 className="panel-title">Security Overview</h2>
            <div className="employee-metrics-grid">
              <OverviewCard
                title="Risk Score"
                value={
                  finalRiskScore == null ? "N/A" : `${finalRiskScore}%`
                }
                detail={
                  finalRiskScore == null
                    ? "Awaiting activity"
                    : riskLevel
                      ? `${riskLevel} risk`
                      : "Current score"
                }
                accent="bg-red-500"
              />
              <OverviewCard
                title="Training"
                value={
                  completedTrainings == null
                    ? "N/A"
                    : `${completedTrainings}`
                }
                detail={trainingDetail}
                accent="bg-emerald-500"
              />
              <OverviewCard
                title="Quizzes"
                value={
                  quizzesCompleted == null
                    ? "N/A"
                    : `${quizzesCompleted}`
                }
                detail="Completed"
                accent="bg-amber-500"
              />
              <OverviewCard
                title="Latest Quiz"
                value={
                  latestQuizResult?.percentage == null
                    ? "N/A"
                    : `${latestQuizResult.percentage}%`
                }
                detail={
                  latestQuizResult
                    ? `${latestQuizResult.correctAnswers}/${latestQuizResult.totalQuestions}`
                    : "No result yet"
                }
                accent="bg-yellow-500"
              />
              <OverviewCard
                title="Phishing"
                value={phishingAwareness ? `${phishingAwareness.score}%` : "N/A"}
                detail={
                  phishingAwareness
                    ? `${phishingAwareness.correctAnswers}/${phishingAwareness.totalScenarios}`
                    : "Pending"
                }
                accent="bg-orange-500"
              />
            </div>
          </section>

          <SecurityProgress
            completedTrainings={completedTrainings}
            pendingTrainings={pendingTrainings}
            quizzesCompleted={quizzesCompleted}
            phishingAwareness={phishingAwareness}
          />

          <section className="mt-10">
            <h2 className="panel-title">Security Awareness Actions</h2>
            <div className="action-grid">
              <Link to="/quiz" className="action-card action-card-primary">
                <span>Take Security Quiz</span>
                <small>Test your security awareness.</small>
              </Link>
              <Link to="/training" className="action-card action-card-success">
                <span>Continue Training</span>
                <small>Keep your learning progress moving.</small>
              </Link>
              <Link to="/phishing" className="action-card action-card-warning">
                <span>Phishing Awareness</span>
                <small>Review phishing awareness activity.</small>
              </Link>
            </div>
          </section>

          <SecurityActivityTimeline activities={dashboard?.recentActivities || []} />
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
