import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import trainingContent from "../data/trainingContent";
import {
  completeTraining,
  getTrainingProgress,
  getTrainings,
} from "../services/trainingService";

const Training = () => {
  const [trainings, setTrainings] = useState([]);
  const [progressByTraining, setProgressByTraining] = useState({});
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completionError, setCompletionError] = useState("");
  const [completingId, setCompletingId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadTraining = async () => {
      setLoading(true);
      setError("");

      try {
        const [trainingResponse, progressResponse] = await Promise.all([
          getTrainings(),
          getTrainingProgress(),
        ]);

        if (!isActive) {
          return;
        }

        const trainingRecords = trainingResponse.data || [];
        const progressRecords = progressResponse.data || [];
        const progressMap = progressRecords.reduce((records, record) => {
          records[record.trainingId] = record;
          return records;
        }, {});

        setTrainings(trainingRecords);
        setProgressByTraining(progressMap);
      } catch (requestError) {
        if (isActive) {
          const status = requestError.response?.status;
          setError(
            status === 401 || status === 403
              ? "You are not authorized to view training."
              : "Unable to load training. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadTraining();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  const handleComplete = async (trainingId) => {
    setCompletingId(trainingId);
    setCompletionError("");

    try {
      const response = await completeTraining(trainingId);
      setProgressByTraining((previousProgress) => ({
        ...previousProgress,
        [trainingId]: response.data,
      }));
    } catch (requestError) {
      const status = requestError.response?.status;
      setCompletionError(
        status === 401 || status === 403
          ? "You are not authorized to save training progress."
          : "Unable to save training progress. Please try again."
      );
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Security Module
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Training Module</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Complete cybersecurity training and build safer everyday habits.
        </p>
      </section>

      {loading ? (
        <p className="rounded-xl bg-white p-6 text-slate-600 shadow-sm">
          Loading training...
        </p>
      ) : error ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : trainings.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-slate-600 shadow-sm">
          No training is available yet.
        </div>
      ) : (
        <>
          {completionError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {completionError}
            </div>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              Learning Materials
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {trainings.map((training) => {
                const trainingId = training._id;
                const progress = progressByTraining[trainingId];
                const isCompleted = Boolean(progress?.completed);
                const progressValue = isCompleted
                  ? 100
                  : progress?.progress ?? 0;
                const isSelected = selectedTrainingId === trainingId;
                const content = trainingContent[training.title] || [
                  "Review the training material carefully.",
                  "Apply the guidance to your everyday security habits.",
                ];

                return (
                  <article
                    key={trainingId}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {training.title}
                        </h3>
                        <p className="mt-2 text-slate-600">
                          {training.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {training.type || "Training"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                      <span>
                        {training.duration
                          ? `${training.duration} minutes`
                          : "Self-paced"}
                      </span>
                      <span
                        className={
                          isCompleted ? "font-semibold text-emerald-600" : ""
                        }
                      >
                        {isCompleted
                          ? "Completed"
                          : `${progressValue}% complete`}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTrainingId(
                          isSelected ? null : trainingId
                        )
                      }
                      className="mt-5 rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      {isSelected ? "Hide Training" : "Start Training"}
                    </button>

                    {isSelected && (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <h4 className="font-semibold text-slate-800">
                          Review this training
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                          {content.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>

                        {isCompleted ? (
                          <p className="mt-5 font-semibold text-emerald-600">
                            ✓ Training completed
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleComplete(trainingId)}
                            disabled={completingId === trainingId}
                            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {completingId === trainingId
                              ? "Saving..."
                              : "Mark as Complete"}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              Cyber Security Quiz
            </h2>
            <p className="mt-2 text-slate-600">
              Test your cybersecurity awareness after reviewing the training
              material.
            </p>
            <Link
              to="/training/quiz"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Quiz
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default Training;
