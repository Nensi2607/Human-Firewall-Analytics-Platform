import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllQuizzes,
  getQuizQuestions,
  submitQuizResult,
} from "../services/quizService";

const areValidQuizQuestions = (questions) => {
  return (
    Array.isArray(questions) &&
    questions.length > 0 &&
    questions.every(
      (question) =>
        typeof question?.question === "string" &&
        question.question.trim().length > 0 &&
        Array.isArray(question.options) &&
        question.options.length > 0 &&
        question.options.every((option) => typeof option === "string")
    )
  );
};

function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submittedResult, setSubmittedResult] = useState(null);
  const [submissionAttempt, setSubmissionAttempt] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (quizId) return undefined;
    let isActive = true;

    const loadQuizzes = async () => {
      setLoading(true);
      setError("");
      try {
        const quizzes = await getAllQuizzes();
        if (isActive) setAvailableQuizzes(quizzes);
      } catch (err) {
        if (isActive) setError(err.response?.data?.message || "Failed to load assigned quizzes.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadQuizzes();
    return () => {
      isActive = false;
    };
  }, [quizId, retryCount]);

  useEffect(() => {
    if (!quizId) return undefined;
    let isActive = true;

    const loadQuiz = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getQuizQuestions(quizId);

        if (areValidQuizQuestions(data)) {
          if (isActive) setQuestions(data);
        } else {
          if (isActive) {
            setError(
              Array.isArray(data) && data.length === 0
                ? "No questions found for this quiz."
                : "Quiz questions could not be loaded correctly."
            );
          }
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || "Failed to load quiz questions.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadQuiz();
    return () => {
      isActive = false;
    };
  }, [quizId, retryCount]);

  const selectAnswer = (option) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [current]: option,
    }));
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((previous) => previous + 1);
    } else {
      setResult(true);
    }
  };

  const previousQuestion = () => {
    if (current > 0) {
      setCurrent((previous) => previous - 1);
    }
  };

  const restartQuiz = () => {
    setCurrent(0);
    setAnswers({});
    setResult(false);
    setSubmissionError("");
    setSubmittedResult(null);
    setSubmissionAttempt(0);
  };

  useEffect(() => {
    if (!quizId || !result || questions.length === 0 || submittedResult) {
      return;
    }

    let isActive = true;

    const saveResult = async () => {
      setSubmissionError("");

      try {
        const response = await submitQuizResult({
          quizId,
          answers: questions.map((_, index) => answers[index]),
        });

        if (isActive) {
          setSubmittedResult(response.data);
        }
      } catch (err) {
        if (isActive) {
          const status = err.response?.status;
          setSubmissionError(
            status === 401 || status === 403
              ? "You are not authorized to save this quiz result."
              : "Unable to save your quiz result. Please try again."
          );
        }
      }
    };

    saveResult();

    return () => {
      isActive = false;
    };
  }, [answers, questions, quizId, result, submissionAttempt, submittedResult]);

  // Loading
  if (loading) {
    return (
      <div className="quiz-status-shell">
        <div className="quiz-status-card">
          <p className="quiz-status-text">⏳ Loading Quiz...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="quiz-status-shell">
        <div className="quiz-status-card quiz-error-card">
          <h2>❌ Unable to Load Quiz</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="quiz-primary-button">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!quizId) {
    return (
      <section className="quiz-page-shell">
        <header className="quiz-header">
          <p className="section-kicker">Security learning</p>
          <h1>Assigned quizzes</h1>
          <p className="quiz-page-copy">Choose a quiz to review and complete.</p>
        </header>

        {availableQuizzes.length === 0 ? (
          <div className="quiz-empty-state">No assigned quizzes are available yet.</div>
        ) : (
          <ul className="quiz-list">
            {availableQuizzes.map((quiz) => (
              <li key={quiz._id} className="quiz-list-item">
                <div className="quiz-list-content">
                  <h2>{quiz.title}</h2>
                  <p>{quiz.description || "Security awareness assessment"}</p>
                  <span>
                    {[quiz.category, quiz.difficulty, quiz.duration ? `${quiz.duration} min` : ""].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <button type="button" onClick={() => navigate(`/quiz/${quiz._id}`)} className="quiz-primary-button">
                  Start quiz
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  // No questions
  if (questions.length === 0) {
    return (
      <div className="quiz-status-shell">
        <div className="quiz-status-card">
          <p className="quiz-status-text">No quiz questions found.</p>
        </div>
      </div>
    );
  }

  // Calculate result
  if (result) {
    const score = submittedResult?.score ?? 0;
    const percentage = submittedResult?.percentage ?? 0;

    const performance =
      percentage >= 80
        ? "Strong awareness"
        : percentage >= 50
        ? "Developing awareness"
        : "Review recommended";

    const performanceColor =
      percentage >= 80
        ? "#16A34A"
        : percentage >= 50
        ? "#F59E0B"
        : "#DC2626";

    const securityMessage =
      percentage >= 80
        ? "Great job! You demonstrated strong security awareness."
        : percentage >= 50
        ? "Good effort. Review the training material to strengthen your security awareness."
        : "Some areas need improvement. Review the training material and try again.";

    return (
      <div className="quiz-page-shell">
        <div className="quiz-result-card">
          <p className="section-kicker">Assessment complete</p>
          <h1>Quiz completed</h1>

          <div className="quiz-result-summary">
            <div>
              <span>Score</span>
              <strong>{score} / {questions.length}</strong>
            </div>
            <div>
              <span>Percentage</span>
              <strong>{percentage}%</strong>
            </div>
          </div>

          <h2 style={{ color: performanceColor }}>{performance}</h2>
          <p className="quiz-result-message">{securityMessage}</p>

          <div className="quiz-result-meta">
            <p>✅ Correct Answers: {score}</p>
            <p>❌ Wrong Answers: {questions.length - score}</p>
          </div>

          {submissionError ? (
            <div className="quiz-result-error">
              <p>{submissionError}</p>
              <button type="button" className="quiz-primary-button" onClick={() => setSubmissionAttempt((attempt) => attempt + 1)}>
                Try again
              </button>
            </div>
          ) : !submittedResult ? (
            <p className="quiz-saving-text">Saving your result...</p>
          ) : null}

          <button type="button" className="quiz-primary-button quiz-restart-button" onClick={restartQuiz}>
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = questions[current];

  const progress =
    ((current + 1) / questions.length) * 100;

  return (
    <div className="quiz-page-shell">
      <div className="quiz-question-card">
        <header className="quiz-header small-header">
          <p className="section-kicker">Security quiz</p>
          <h1>Cyber Security Awareness Quiz</h1>
        </header>

        <div className="quiz-progress-wrap">
          <div className="quiz-progress-track">
            <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="quiz-progress-label">Question {current + 1} of {questions.length}</p>
        </div>

        <h2 className="quiz-question-title">{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectAnswer(option)}
              className={`quiz-option-button ${answers[current] === option ? "selected" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="quiz-navigation">
          <button
            type="button"
            onClick={previousQuestion}
            disabled={current === 0}
            className={`quiz-nav-button quiz-nav-secondary ${current === 0 ? "disabled" : ""}`}
          >
            ◀ Previous
          </button>

          <button
            type="button"
            onClick={nextQuestion}
            disabled={!answers[current]}
            className={`quiz-nav-button quiz-nav-primary ${!answers[current] ? "disabled" : ""}`}
          >
            {current === questions.length - 1 ? "Submit Quiz" : "Next ▶"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;