const fallbackActivities = [
  { title: "Training completed", time: "2 hours ago" },
  { title: "Quiz submitted", time: "Yesterday" },
  { title: "Phishing simulation reviewed", time: "3 days ago" },
];

const RecentActivities = ({ activities = fallbackActivities }) => {
  return (
    <section style={{ marginTop: "32px" }}>
      <h2 style={{ marginBottom: "16px", color: "#111827" }}>Recent Activities</h2>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        {activities.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No recent activity yet.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {activities.map((activity, index) => (
              <li
                key={`${activity.title ?? "activity"}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom:
                    index === activities.length - 1 ? "none" : "1px solid #e5e7eb",
                }}
              >
                <span style={{ color: "#1f2937", fontWeight: 600 }}>
                  {activity.title || "Security activity"}
                </span>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  {activity.time || activity.date || "Recently"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default RecentActivities;
