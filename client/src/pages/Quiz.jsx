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
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          fontSize: "24px",
        }}
      >
        ⏳ Loading Quiz...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "80px auto",
          padding: "30px",
          background: "white",
          borderRadius: "15px",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ color: "#DC2626" }}>
          ❌ Unable to Load Quiz
        </h2>

        <p
          style={{
            marginTop: "15px",
            color: "#555",
          }}
        >
          {error}
        </p>

        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-5 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  if (!quizId) {
    return (
      <section className="mx-auto max-w-4xl">
        <header className="mb-6 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Security learning</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Assigned quizzes</h1>
          <p className="mt-2 text-slate-600">Choose a quiz to review and complete.</p>
        </header>
        {availableQuizzes.length === 0 ? (
          <p className="py-8 text-slate-500">No assigned quizzes are available yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {availableQuizzes.map((quiz) => (
              <li key={quiz._id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <h2 className="font-semibold text-slate-900">{quiz.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{quiz.description || "Security awareness assessment"}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">{[quiz.category, quiz.difficulty, quiz.duration ? `${quiz.duration} min` : ""].filter(Boolean).join(" · ")}</p>
                </div>
                <button type="button" onClick={() => navigate(`/quiz/${quiz._id}`)} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">Start quiz</button>
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
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          fontSize: "22px",
        }}
      >
        No quiz questions found.
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
      <div
        style={{
          maxWidth: "700px",
          margin: "50px auto",
          background: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>🎉 Quiz Completed</h1>

        <h2 style={{ marginTop: "25px" }}>
          Score: {score} / {questions.length}
        </h2>

        <h2>{percentage}%</h2>

        <h2 style={{ color: performanceColor }}>
          {performance}
        </h2>

        <p style={{ marginTop: "15px", color: "#555" }}>
          {securityMessage}
        </p>

        <p>✅ Correct Answers: {score}</p>

        <p>
          ❌ Wrong Answers: {questions.length - score}
        </p>

        {submissionError ? (
          <div style={{ marginTop: "20px", color: "#DC2626" }}>
            <p>{submissionError}</p>
            <button
              onClick={() => setSubmissionAttempt((attempt) => attempt + 1)}
              style={{
                marginTop: "12px",
                padding: "10px 20px",
                background: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        ) : !submittedResult ? (
          <p style={{ marginTop: "20px", color: "#6B7280" }}>
            Saving your result...
          </p>
        ) : null}

        <button
          onClick={restartQuiz}
          style={{
            marginTop: "25px",
            padding: "12px 25px",
            background: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const question = questions[current];

  const progress =
    ((current + 1) / questions.length) * 100;

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "40px auto",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "35px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1>🛡 Cyber Security Awareness Quiz</h1>

        {/* Progress */}
        <div
          style={{
            marginTop: "25px",
            height: "10px",
            background: "#E5E7EB",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#2563EB",
              borderRadius: "10px",
            }}
          />
        </div>

        <p
          style={{
            marginTop: "15px",
            color: "#666",
          }}
        >
          Question {current + 1} of {questions.length}
        </p>

        {/* Question */}
        <h2 style={{ marginTop: "25px" }}>
          {question.question}
        </h2>

        {/* Options */}
        <div style={{ marginTop: "25px" }}>
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(option)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "16px",
                marginBottom: "15px",
                borderRadius: "10px",
                border:
                  answers[current] === option
                    ? "2px solid #2563EB"
                    : "1px solid #D1D5DB",
                background:
                  answers[current] === option
                    ? "#DBEAFE"
                    : "white",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <button
            onClick={previousQuestion}
            disabled={current === 0}
            style={{
              padding: "12px 25px",
              background:
                current === 0 ? "#D1D5DB" : "#6B7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                current === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ◀ Previous
          </button>

          <button
            onClick={nextQuestion}
            disabled={!answers[current]}
            style={{
              padding: "12px 30px",
              background: !answers[current]
                ? "#D1D5DB"
                : "#2563EB",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: !answers[current]
                ? "not-allowed"
                : "pointer",
            }}
          >
            {current === questions.length - 1
              ? "Submit Quiz"
              : "Next ▶"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;