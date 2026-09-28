import { Link } from "react-router-dom";

const actions = [
  { label: "Create Campaign", to: "/admin/campaigns", tone: "#2563eb" },
  { label: "Review Employees", to: "/admin/employees", tone: "#10b981" },
  { label: "Manage Quizzes", to: "/admin/quiz-management", tone: "#f59e0b" },
];

const QuickActions = () => {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <h2>Quick Actions</h2>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="quick-action"
            style={{ color: action.tone, borderColor: `${action.tone}25` }}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
