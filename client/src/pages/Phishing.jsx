import { useState } from "react";
import { Link } from "react-router-dom";
import phishingScenarios from "../data/phishingScenarios";
import { submitPhishingAwarenessResult } from "../services/phishingAwarenessService";

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
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Security Module
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Phishing Awareness</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Learn how to identify suspicious emails, links, and messages before they become security incidents.
        </p>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {awarenessCards.map((card) => (
          <article
            key={card.title}
            className={`rounded-xl border p-5 shadow-sm ${card.color}`}
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">How to Spot Phishing</h2>
          <p className="mt-2 text-slate-600">
            Pause before responding and look for several warning signs together.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {indicators.map((indicator) => (
            <li
              key={indicator}
              className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 font-bold text-blue-600">!</span>
              <span>{indicator}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Interactive Challenge
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Spot the Phishing
            </h2>
            <p className="mt-2 text-slate-600">
              Review each fictional message and decide whether it is phishing or legitimate.
            </p>
          </div>
          {!completed && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              Scenario {scenarioIndex + 1} of {phishingScenarios.length}
            </span>
          )}
        </div>

        {completed ? (
          <div className="mt-8 rounded-xl bg-blue-50 p-6 text-center">
            <h3 className="text-2xl font-bold text-slate-900">Phishing Awareness Score</h3>
            <p className="mt-4 text-4xl font-bold text-blue-700">
              {resultCorrect} / {resultTotal} correct
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-700">
              {resultScore}%
            </p>
            {submissionError ? (
              <p className="mt-4 text-sm text-red-600">{submissionError}</p>
            ) : (
              <p className="mt-4 text-slate-600">
                {getFeedback(resultCorrect, resultTotal)}
              </p>
            )}
            <button
              type="button"
              onClick={restartChallenge}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-[auto_1fr]">
                <span className="font-semibold">From:</span>
                <span>{scenario.sender}</span>
                <span className="font-semibold">Subject:</span>
                <span>{scenario.subject}</span>
              </div>
              <p className="mt-6 leading-7 text-slate-700">{scenario.message}</p>
              <button
                type="button"
                className="mt-5 rounded-lg border border-blue-300 bg-white px-4 py-2 font-semibold text-blue-700"
              >
                Verify Account
              </button>
            </div>

            <h3 className="mt-8 text-lg font-semibold text-slate-900">
              Do you think this message is legitimate or phishing?
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["phishing", "legitimate"].map((answer) => {
                const isSelected = selectedAnswer === answer;
                const answerLabel = answer[0].toUpperCase() + answer.slice(1);

                return (
                  <button
                    key={answer}
                    type="button"
                    onClick={() => answerScenario(answer)}
                    className={`rounded-lg border px-4 py-3 text-left font-semibold transition ${
                      isSelected
                        ? isCorrect
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-red-400 bg-red-50 text-red-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {answerLabel}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div
                className={`mt-5 rounded-lg p-4 ${
                  isCorrect ? "bg-emerald-50" : "bg-amber-50"
                }`}
              >
                <p
                  className={`font-semibold ${
                    isCorrect ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {isCorrect
                    ? "Correct! You identified the message accurately."
                    : "Not quite. This message contains several phishing indicators."}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {scenario.indicators.map((indicator) => (
                    <li key={indicator}>- {indicator}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={moveToNextScenario}
                  disabled={submitting}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
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

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          When You Receive a Suspicious Message
        </h2>
        <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            "Do not click suspicious links.",
            "Do not open unexpected attachments.",
            "Verify the sender.",
            "Check the destination URL before clicking.",
            "Never share passwords or OTPs.",
            "Report suspicious messages to the security team.",
          ].map((tip, index) => (
            <li key={tip} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-bold text-blue-600">{index + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
        <Link
          to="/employee"
          className="mt-6 inline-block font-semibold text-blue-600 hover:text-blue-700"
        >
          Return to Security Awareness Dashboard
        </Link>
      </section>
    </div>
  );
};

export default Phishing;
