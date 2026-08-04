const actions = [
  { title: "➕ Add Employee", color: "#2563EB" },
  { title: "🎣 Launch Campaign", color: "#DC2626" },
  { title: "🎓 Assign Training", color: "#0891B2" },
  { title: "📊 Generate Report", color: "#475569" },
];

const QuickActions = () => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#111827",
        }}
      >
        Quick Actions
      </h2>

      {actions.map((action, index) => (
        <button
          key={index}
          style={{
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: `2px solid ${action.color}`,
  background: "#F8FAFC",
  color: action.color,
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
}}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;