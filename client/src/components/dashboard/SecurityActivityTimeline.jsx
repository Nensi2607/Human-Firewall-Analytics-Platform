const SecurityActivityTimeline = ({ activities = [] }) => {
  return (
    <section className="mt-10">
      <h2 className="panel-title">Recent activity</h2>
      <div className="compact-activity-card">
        {activities.length === 0 ? (
          <p className="metric-subtext">No recent activity</p>
        ) : (
          <ul className="compact-activity-list">
            {activities.map((activity, index) => (
              <li key={`${activity.title ?? "activity"}-${index}`}>
                <span className="activity-dot" />
                <div>
                  <p>{activity.title || "Security activity"}</p>
                  <small>{activity.time || activity.date || "Recently"}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SecurityActivityTimeline;
