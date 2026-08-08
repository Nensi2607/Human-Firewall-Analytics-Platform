import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuizQuestions } from "../services/quizService";
import quizData from "../data/quizData";

function Quiz() {
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError("");

      // Use local sample quiz when no ID is provided
      if (!quizId || quizId === "sample") {
        setQuestions(quizData);
        setLoading(false);
        return;
      }

      try {
        console.log("Loading quiz:", quizId);

        const data = await getQuizQuestions(quizId);

        console.log("Questions received:", data);

        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        } else {
          setError("No questions found for this quiz.");
        }
      } catch (err) {
        console.error("Quiz loading error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load quiz questions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

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
  };

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

        <p
          style={{
            marginTop: "15px",
            fontSize: "14px",
            color: "#777",
          }}
        >
          Quiz ID: {quizId || "sample"}
        </p>
      </div>
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
    let score = 0;

    questions.forEach((question, index) => {
      const selectedAnswer = answers[index];

      if (selectedAnswer === question.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round(
      (score / questions.length) * 100
    );

    const risk =
      percentage >= 80
        ? "Low Risk"
        : percentage >= 50
        ? "Medium Risk"
        : "High Risk";

    const riskColor =
      percentage >= 80
        ? "#16A34A"
        : percentage >= 50
        ? "#F59E0B"
        : "#DC2626";

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

        <h2 style={{ color: riskColor }}>
          {risk}
        </h2>

        <p>✅ Correct Answers: {score}</p>

        <p>
          ❌ Wrong Answers: {questions.length - score}
        </p>

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