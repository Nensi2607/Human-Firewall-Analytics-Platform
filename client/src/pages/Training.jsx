import { Link } from "react-router-dom";

function Training() {
  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ marginBottom: "8px" }}>
        🛡 Training Module
      </h1>

      <p style={{ color: "#666", marginBottom: "30px" }}>
        Complete cybersecurity training and test your awareness.
      </p>

      {/* Learning Materials */}
      <div
        style={{
          background: "#fff",
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "25px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
        }}
      >
        <h2>📚 Learning Materials</h2>

        <ul
          style={{
            marginTop: "20px",
            lineHeight: "2",
            fontSize: "17px",
          }}
        >
          <li>🔐 Password Security</li>
          <li>📧 Email Security</li>
          <li>🎣 Phishing Awareness</li>
          <li>🌐 Safe Internet Browsing</li>
        </ul>
      </div>

      {/* Quiz Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
        }}
      >
        <h2>📝 Cyber Security Quiz</h2>

        <p style={{ color: "#555" }}>
          Test your cybersecurity awareness after completing the training.
        </p>

        <div style={{ marginTop: "20px" }}>
          <span
            style={{
              background: "#E0F2FE",
              color: "#0369A1",
              padding: "6px 12px",
              borderRadius: "20px",
              marginRight: "10px",
            }}
          >
            10 Minutes
          </span>

          <span
            style={{
              background: "#DCFCE7",
              color: "#166534",
              padding: "6px 12px",
              borderRadius: "20px",
            }}
          >
            Easy
          </span>
        </div>

        <Link to="/training/quiz">
          <button
            style={{
              marginTop: "30px",
              background: "#2563EB",
              color: "white",
              border: "none",
              padding: "14px 28px",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            🚀 Start Quiz
          </button>
          
        </Link>
      </div>
    </div>
  );
}

export default Training;