import { Link } from "react-router-dom";

const ProgressTrack = ({ percentage }) => (
  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-emerald-500 transition-all"
      style={{ width: `${percentage}%` }}
    />
  </div>
);

const SecurityProgress = ({
  completedTrainings,
  pendingTrainings,
  quizzesCompleted,
  phishingAwareness,
}) => {
  const hasTrainingCounts =
    typeof completedTrainings === "number" &&
    typeof pendingTrainings === "number";
  const trainingTotal = hasTrainingCounts
    ? completedTrainings + pendingTrainings
    : null;
  const trainingPercentage = trainingTotal && trainingTotal > 0
    ? Math.round((completedTrainings / trainingTotal) * 100)
    : null;

  return (
    <section className="security-progress-section mt-10">
      <h2 className="panel-title">Progress</h2>

      <div className="security-progress-grid">
        <div className="progress-card">
          <div className="progress-card-header">
            <span>Training</span>
            <strong>{trainingPercentage == null ? "—" : `${trainingPercentage}%`}</strong>
          </div>
          {trainingPercentage === null ? (
            <p className="metric-subtext">No data</p>
          ) : (
            <>
              <div className="progress-meta">
                <span>
                  {completedTrainings} / {trainingTotal}
                </span>
              </div>
              <ProgressTrack percentage={trainingPercentage} />
            </>
          )}
        </div>

        <div className="progress-card">
          <div className="progress-card-header">
            <span>Quiz</span>
            <strong>
              {typeof quizzesCompleted === "number" ? `${quizzesCompleted}` : "—"}
            </strong>
          </div>
          <p className="metric-subtext">
            {typeof quizzesCompleted === "number" ? "Completed" : "No result"}
          </p>
          <Link to="/quiz" className="inline-link">
            Open
          </Link>
        </div>

        <div className="progress-card">
          <div className="progress-card-header">
            <span>Phishing</span>
            <strong>
              {phishingAwareness ? `${phishingAwareness.score}%` : "—"}
            </strong>
          </div>
          {phishingAwareness ? (
            <p className="metric-subtext">
              {phishingAwareness.correctAnswers} / {phishingAwareness.totalScenarios} correct
            </p>
          ) : (
            <p className="metric-subtext">Not started</p>
          )}
          <Link to="/phishing" className="inline-link">
            View
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SecurityProgress;