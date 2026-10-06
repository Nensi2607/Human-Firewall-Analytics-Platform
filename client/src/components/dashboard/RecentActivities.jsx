import { useEffect, useState } from "react";
import { getNotifications } from "../../services/notificationService";

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;
    void getNotifications()
      .then((response) => {
        if (isActive) {
          setActivities((response.data || []).slice(0, 5).map((notification) => ({
            title: notification.title,
            time: notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : "",
          })));
        }
      })
      .catch(() => {
        if (isActive) setError(true);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <h2>Recent Activities</h2>
      </div>

      {loading ? (
        <p className="empty-state">Loading recent activity...</p>
      ) : error ? (
        <p className="empty-state">Unable to load recent activity.</p>
      ) : activities.length === 0 ? (
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
