import { Link } from "react-router-dom";

const actions = [
  { label: "Create Campaign", to: "/admin/campaigns", tone: "#2563eb" },
  { label: "Review Employees", to: "/admin/employees", tone: "#10b981" },
  { label: "Manage Quizzes", to: "/admin/quiz-management", tone: "#f59e0b" },
];

const QuickActions = () => {
  return (
    <section style={{ marginTop: "32px" }}>
      <h2 style={{ marginBottom: "16px", color: "#111827" }}>Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            style={{
              display: "block",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "18px",
              textDecoration: "none",
              color: action.tone,
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
