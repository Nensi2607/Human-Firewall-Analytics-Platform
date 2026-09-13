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
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">
        Security Progress
      </h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Training Progress</h3>
          {trainingPercentage === null ? (
            <p className="mt-3 text-sm text-slate-500">
              No training progress available yet.
            </p>
          ) : (
            <>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span>
                  {completedTrainings} / {trainingTotal} completed
                </span>
                <span>{trainingPercentage}%</span>
              </div>
              <ProgressTrack percentage={trainingPercentage} />
            </>
          )}
          <p className="mt-4 text-sm text-slate-500">
            {pendingTrainings > 0
              ? "Keep going - complete your remaining training."
              : "Review your available training materials."}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Quiz Progress</h3>
          <p className="mt-3 text-2xl font-bold text-amber-600">
            {typeof quizzesCompleted === "number"
              ? `${quizzesCompleted} completed`
              : "Not available yet"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            A total quiz count or latest score is not available yet.
          </p>
          <Link
            to="/quiz"
            className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-700"
          >
            Test your security awareness
          </Link>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">
            Phishing Awareness Progress
          </h3>
          {phishingAwareness ? (
            <>
              <p className="mt-3 text-2xl font-bold text-orange-600">
                {phishingAwareness.score}%
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {phishingAwareness.correctAnswers} / {phishingAwareness.totalScenarios} correct
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Not completed. Complete the phishing awareness challenge to see your score.
            </p>
          )}
          <Link
            to="/phishing"
            className="mt-4 inline-block font-semibold text-amber-600 hover:text-amber-700"
          >
            Review phishing awareness
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SecurityProgress;