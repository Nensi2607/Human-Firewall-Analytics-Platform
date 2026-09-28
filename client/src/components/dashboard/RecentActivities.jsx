const fallbackActivities = [
  { title: "Training completed", time: "2 hours ago" },
  { title: "Quiz submitted", time: "Yesterday" },
  { title: "Phishing simulation reviewed", time: "3 days ago" },
];

const RecentActivities = ({ activities = fallbackActivities }) => {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <h2>Recent Activities</h2>
      </div>

      {activities.length === 0 ? (
        <p className="empty-state">No recent activity yet.</p>
      ) : (
        <ul className="activity-list">
          {activities.map((activity, index) => (
            <li key={`${activity.title ?? "activity"}-${index}`} className="activity-item">
              <span>{activity.title || "Security activity"}</span>
              <time>{activity.time || activity.date || "Recently"}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentActivities;
