import { Link } from "react-router-dom";

const actions = [
  { label: "Create Campaign", to: "/admin/phishing" },
  { label: "Review Employees", to: "/employees" },
  { label: "Manage Quizzes", to: "/admin/quizzes" },
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
            style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
