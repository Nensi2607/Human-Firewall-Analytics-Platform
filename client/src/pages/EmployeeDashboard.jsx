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
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Security Awareness Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome{dashboard?.employee?.firstName
            ? `, ${dashboard.employee.firstName}`
            : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Build strong security habits by completing your training, quizzes,
          and phishing awareness activities.
        </p>
      </section>

      {loading ? (
        <h3 className="text-lg font-semibold text-slate-700">
          Loading your security dashboard...
        </h3>
      ) : error ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-red-600">{error}</h3>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : !dashboard ? (
        <h3 className="text-lg font-semibold text-slate-700">
          Unable to load your security dashboard.
        </h3>
      ) : (
        <>
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              Security Overview
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewCard
                title="Security Risk Score"
                value={
                  finalRiskScore == null
                    ? "Not available yet"
                    : `${finalRiskScore}%`
                }
                detail={
                  finalRiskScore == null
                    ? "Complete security activities to calculate your score."
                    : `Risk Score: higher = more risk${
                        riskLevel ? ` · ${riskLevel} risk` : ""
                      }${
                        securityAwarenessScore == null
                          ? ""
                          : ` · Awareness: ${securityAwarenessScore}%`
                      }`
                }
                accent="bg-red-500"
              />
              <OverviewCard
                title="Training Progress"
                value={
                  completedTrainings == null
                    ? "Not available yet"
                    : `${completedTrainings} completed`
                }
                detail={trainingDetail}
                accent="bg-emerald-500"
              />
              <OverviewCard
                title="Quiz Performance"
                value={
                  quizzesCompleted == null
                    ? "Not available yet"
                    : `${quizzesCompleted} completed`
                }
                detail="Latest quiz score not available yet"
                accent="bg-amber-500"
              />
              <OverviewCard
                title="Latest Quiz"
                value={
                  latestQuizResult?.percentage == null
                    ? "Not completed yet"
                    : `${latestQuizResult.percentage}%`
                }
                detail={
                  latestQuizResult
                    ? `${latestQuizResult.correctAnswers} / ${latestQuizResult.totalQuestions} correct`
                    : "Complete a quiz to see your latest result."
                }
                accent="bg-yellow-500"
              />
              <OverviewCard
                title="Phishing Awareness"
                value={phishingAwareness ? `${phishingAwareness.score}%` : "Not completed"}
                detail={
                  phishingAwareness
                    ? `${phishingAwareness.correctAnswers} / ${phishingAwareness.totalScenarios} correct`
                    : "Complete the phishing awareness challenge to see your score."
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
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              Security Awareness Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link
                to="/quiz"
                className="rounded-xl border border-blue-200 bg-white px-5 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
              >
                <span className="block font-semibold text-blue-700">
                  Take Security Quiz
                </span>
                <span className="mt-2 block text-sm text-slate-500">
                  Test your security awareness.
                </span>
              </Link>
              <Link
                to="/training"
                className="rounded-xl border border-emerald-200 bg-white px-5 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
              >
                <span className="block font-semibold text-emerald-700">
                  Continue Training
                </span>
                <span className="mt-2 block text-sm text-slate-500">
                  Keep your learning progress moving.
                </span>
              </Link>
              <Link
                to="/phishing"
                className="rounded-xl border border-amber-200 bg-white px-5 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
              >
                <span className="block font-semibold text-amber-700">
                  Phishing Awareness
                </span>
                <span className="mt-2 block text-sm text-slate-500">
                  Review phishing awareness activity.
                </span>
              </Link>
            </div>
          </section>

          <SecurityActivityTimeline
            activities={dashboard?.recentActivities || []}
          />
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
