import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="training-page-shell">
      <section className="training-page-header">
        <h1>Training Module</h1>
        <p>
          Complete cybersecurity training and build safer everyday habits.
        </p>
      </section>

      {loading ? (
        <p className="training-state-card">Loading training...</p>
      ) : error ? (
        <div className="training-state-card training-error-card">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="quiz-primary-button training-retry-button"
          >
            Retry
          </button>
        </div>
      ) : trainings.length === 0 ? (
        <div className="training-state-card">No training is available yet.</div>
      ) : (
        <>
          {completionError && (
            <div className="training-alert">{completionError}</div>
          )}

          <section className="training-section">
            <h2 className="panel-title">Learning Materials</h2>
            <div className="training-grid">
              {trainings.map((training) => {
                const trainingId = training._id;
                const progress = progressByTraining[trainingId];
                const isCompleted = Boolean(progress?.completed);
                const progressValue = isCompleted
                  ? 100
                  : progress?.progress ?? 0;
                const isSelected = selectedTrainingId === trainingId;
                const content = training.description
                  ? [training.description]
                  : ["Review the training material carefully."];

                return (
                  <article key={trainingId} className="training-card">
                    <div className="training-card-header">
                      <div className="training-card-copy">
                        <h3>{training.title}</h3>
                        <p>{training.description}</p>
                      </div>
                      <span className="training-card-type">
                        {training.type || "Training"}
                      </span>
                    </div>

                    <div className="training-card-meta">
                      <span>
                        {training.duration
                          ? `${training.duration} minutes`
                          : "Self-paced"}
                      </span>
                      <span className={isCompleted ? "training-complete" : ""}>
                        {isCompleted ? "Completed" : `${progressValue}% complete`}
                      </span>
                    </div>
                    <div className="training-progress-track">
                      <div
                        className="training-progress-bar"
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTrainingId(isSelected ? null : trainingId)}
                      className="training-toggle-button"
                    >
                      {isSelected ? "Hide Training" : "Start Training"}
                    </button>

                    {isSelected && (
                      <div className="training-detail-panel">
                        <h4>Review this training</h4>
                        <ul>
                          {content.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                        {training.resourceURL && (
                          <a
                            href={training.resourceURL}
                            target="_blank"
                            rel="noreferrer"
                            className="training-resource-link"
                          >
                            Open training resource
                          </a>
                        )}

                        {isCompleted ? (
                          <p className="training-completion-text">
                            ✓ Training completed
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleComplete(trainingId)}
                            disabled={completingId === trainingId}
                            className="training-complete-button"
                          >
                            {completingId === trainingId ? "Saving..." : "Mark as Complete"}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="training-quiz-box">
            <h2>Cyber Security Quiz</h2>
            <p>
              Test your cybersecurity awareness after reviewing the training
              material.
            </p>
            <Link to="/training/quiz" className="training-quiz-link">
              Start Quiz
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default Training;
