import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import phishingScenarios from "../data/phishingScenarios";
import { submitPhishingAwarenessResult } from "../services/phishingAwarenessService";
import {
  getMyPhishingAttempts,
  reportPhishingAttempt,
} from "../services/phishingAttemptService";

const awarenessCards = [
  {
    title: "Suspicious Links",
    description: "Check the real destination before opening a link, especially when the message is unexpected.",
    color: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    title: "Urgent Requests",
    description: "Threats, deadlines, and pressure to act quickly are common phishing tactics.",
    color: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    title: "Fake Login Pages",
    description: "Never enter a password after following an unfamiliar sign-in link. Use a known bookmark instead.",
    color: "border-red-200 bg-red-50 text-red-700",
  },
  {
    title: "Unexpected Attachments",
    description: "Treat unplanned documents and requests to enable macros or editing as warning signs.",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
];

const indicators = [
  "Suspicious sender address",
  "Urgent or threatening language",
  "Unexpected attachments",
  "Suspicious links",
  "Requests for passwords or sensitive information",
  "Poor grammar or unusual formatting",
  "Fake login pages",
  "Offers that look too good to be true",
];

const getFeedback = (score, total) => {
  const percentage = Math.round((score / total) * 100);

  if (percentage >= 90) {
    return "Excellent phishing awareness.";
  }

  if (percentage >= 70) {
    return "Good awareness. Review a few warning signs.";
  }

  return "More training recommended. Review the phishing indicators.";
};

const Phishing = () => {
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptsError, setAttemptsError] = useState("");
  const [reportingId, setReportingId] = useState("");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [savedResult, setSavedResult] = useState(null);
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const scenario = phishingScenarios[scenarioIndex];
  const hasAnswered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === scenario.correctAnswer;
  const isLastScenario = scenarioIndex === phishingScenarios.length - 1;

  useEffect(() => {
    let isActive = true;
    void getMyPhishingAttempts()
      .then((response) => {
        if (isActive) setAttempts(response.data || []);
      })
      .catch(() => {
        if (isActive) setAttemptsError("Unable to load your simulation history.");
      })
      .finally(() => {
        if (isActive) setAttemptsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleReportAttempt = async (attemptId) => {
    setReportingId(attemptId);
    setAttemptsError("");
    try {
      const response = await reportPhishingAttempt(attemptId);
      setAttempts((current) => current.map((attempt) => (
        attempt._id === attemptId ? response.data : attempt
      )));
    } catch (error) {
      setAttemptsError(error.response?.data?.message || "Unable to report this simulation.");
    } finally {
      setReportingId("");
    }
  };

  const answerScenario = (answer) => {
    if (hasAnswered) {
      return;
    }

    setSelectedAnswer(answer);
    if (answer === scenario.correctAnswer) {
      setScore((previousScore) => previousScore + 1);
    }
  };

  const moveToNextScenario = async () => {
    if (isLastScenario) {
      setSubmitting(true);
      setSubmissionError("");

      try {
        const response = await submitPhishingAwarenessResult(
          phishingScenarios.length,
          score
        );
        setSavedResult(response.data);
      } catch (error) {
        setSubmissionError(
          error.response?.status === 401 || error.response?.status === 403
            ? "You are not authorized to save this awareness result."
            : "Unable to save your awareness result. Your local score is still available."
        );
      } finally {
        setSubmitting(false);
        setCompleted(true);
      }
      return;
    }

    setScenarioIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer("");
  };

  const restartChallenge = () => {
    setScenarioIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setCompleted(false);
    setSavedResult(null);
    setSubmissionError("");
    setSubmitting(false);
  };

  const resultTotal = savedResult?.totalScenarios || phishingScenarios.length;
  const resultCorrect = savedResult?.correctAnswers ?? score;
  const resultScore =
    savedResult?.score ?? Math.round((score / phishingScenarios.length) * 100);

  return (
    <div className="phishing-page-shell">
      <section className="phishing-page-header">
        <p className="section-kicker">Security Module</p>
        <p className="phishing-page-subhead">
          Learn how to identify suspicious emails, links, and messages before they become security incidents.
        </p>
      </section>

      <section className="phishing-awareness-grid">
        {awarenessCards.map((card) => (
          <article
            key={card.title}
            className={`phishing-tip-card ${card.color}`}
          >
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="phishing-section">
        <div className="phishing-section-head">
          <div>
            <h2>Simulation history</h2>
            <p>Only your own controlled simulation activity is shown. Email opens are not tracked.</p>
          </div>
        </div>
        {attemptsError && <p role="alert" className="phishing-alert">{attemptsError}</p>}
        {attemptsLoading ? <p role="status" className="phishing-muted">Loading simulation history...</p> : attempts.length === 0 ? (
          <p className="phishing-muted">No campaign simulations have been assigned to you.</p>
        ) : (
          <ul className="phishing-history-list">
            {attempts.map((attempt) => {
              const expired = attempt.expiresAt && new Date(attempt.expiresAt) < new Date();
              const status = attempt.reported
                ? "Reported"
                : attempt.linkClicked || attempt.clicked
                  ? "Link clicked"
                  : expired
                    ? "No response before expiry"
                    : "Awaiting response";
              return (
                <li key={attempt._id} className="phishing-history-item">
                  <div>
                    <h3>{attempt.campaignId?.title || "Security simulation"}</h3>
                    <p>{status} · Sent {new Date(attempt.sentAt).toLocaleDateString()}</p>
                    {attempt.clickedAt && <p className="phishing-history-detail">Link clicked {new Date(attempt.clickedAt).toLocaleString()}</p>}
                  </div>
                  {!attempt.reported && (
                    <button type="button" onClick={() => handleReportAttempt(attempt._id)} disabled={reportingId === attempt._id} className="phishing-report-button">
                      {reportingId === attempt._id ? "Reporting..." : "Report Suspicious Email"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="phishing-panel">
        <div className="phishing-panel-header">
          <h2>How to Spot Phishing</h2>
          <p>
            Pause before responding and look for several warning signs together.
          </p>
        </div>
        <ul className="phishing-indicator-list">
          {indicators.map((indicator) => (
            <li key={indicator}>
              <span>!</span>
              <span>{indicator}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="phishing-panel">
        <div className="phishing-challenge-header">
          <div>
            <p className="section-kicker phishing-kicker">Interactive Challenge</p>
            <h2>Spot the Phishing</h2>
            <p>
              Review each fictional message and decide whether it is phishing or legitimate.
            </p>
          </div>
          {!completed && (
            <span className="phishing-scenario-pill">
              Scenario {scenarioIndex + 1} of {phishingScenarios.length}
            </span>
          )}
        </div>

        {completed ? (
          <div className="phishing-score-box">
            <h3>Phishing Awareness Score</h3>
            <p className="phishing-score-value">
              {resultCorrect} / {resultTotal} correct
            </p>
            <p className="phishing-score-percent">
              {resultScore}%
            </p>
            {submissionError ? (
              <p className="phishing-score-error">{submissionError}</p>
            ) : (
              <p className="phishing-score-copy">
                {getFeedback(resultCorrect, resultTotal)}
              </p>
            )}
            <button
              type="button"
              onClick={restartChallenge}
              className="phishing-primary-button"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="phishing-challenge-body">
            <div className="phishing-message-card">
              <div className="phishing-message-meta">
                <span>From:</span>
                <span>{scenario.sender}</span>
                <span>Subject:</span>
                <span>{scenario.subject}</span>
              </div>
              <p>{scenario.message}</p>
              <p className="phishing-message-link" aria-label="Example link shown in the simulated message">
                Verify Account
              </p>
            </div>

            <h3>
              Do you think this message is legitimate or phishing?
            </h3>
            <div className="phishing-answer-grid">
              {["phishing", "legitimate"].map((answer) => {
                const isSelected = selectedAnswer === answer;
                const answerLabel = answer[0].toUpperCase() + answer.slice(1);

                return (
                  <button
                    key={answer}
                    type="button"
                    onClick={() => answerScenario(answer)}
                    className={`phishing-answer-button ${
                      isSelected
                        ? isCorrect
                          ? "selected-success"
                          : "selected-error"
                        : ""
                    }`}
                  >
                    {answerLabel}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div
                className={`phishing-feedback ${
                  isCorrect ? "phishing-feedback-success" : "phishing-feedback-warning"
                }`}
              >
                <p>
                  {isCorrect
                    ? "Correct! You identified the message accurately."
                    : "Not quite. This message contains several phishing indicators."}
                </p>
                <ul>
                  {scenario.indicators.map((indicator) => (
                    <li key={indicator}>- {indicator}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={moveToNextScenario}
                  disabled={submitting}
                  className="phishing-primary-button"
                >
                  {submitting
                    ? "Saving Result..."
                    : isLastScenario
                    ? "View Score"
                    : "Next Scenario"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="phishing-panel phishing-panel-final">
        <h2>When You Receive a Suspicious Message</h2>
        <ol className="phishing-tips-list">
          {[
            "Do not click suspicious links.",
            "Do not open unexpected attachments.",
            "Verify the sender.",
            "Check the destination URL before clicking.",
            "Never share passwords or OTPs.",
            "Report suspicious messages to the security team.",
          ].map((tip, index) => (
            <li key={tip}>
              <span>{index + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
        <Link to="/employee" className="phishing-return-link">
          Return to Security Awareness Dashboard
        </Link>
      </section>
    </div>
  );
};

export default Phishing;
