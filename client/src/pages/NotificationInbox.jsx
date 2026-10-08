import { useEffect, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const NotificationInbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
      setError("");
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadNotifications);
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleMarkRead = async (notificationId) => {
    setUpdatingId(notificationId);
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      setError("Unable to update this notification.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        isRead: true,
      })));
      setUnreadCount(0);
    } catch {
      setError("Unable to update notifications.");
    }
  };

  return (
    <section className="employee-dashboard-shell notifications-page-shell">
      <header className="employee-dashboard-intro notifications-page-header">
        <div className="notifications-header-left">
          <p className="section-kicker">Updates</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="notifications-mark-all-button"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </header>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="state-card">
          <p className="dashboard-state">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="state-card">
          <p className="dashboard-state">No notifications yet.</p>
        </div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`notification-item ${notification.isRead ? "" : "notification-item-unread"}`}
            >
              <div className="notification-copy">
                <div className="notification-header-row">
                  <h2>{notification.title}</h2>
                  {!notification.isRead && (
                    <span className="notification-badge">New</span>
                  )}
                </div>
                <p className="notification-message">{notification.message}</p>
                <time className="notification-time" dateTime={notification.createdAt}>
                  {dateFormatter.format(new Date(notification.createdAt))}
                </time>
              </div>
              {!notification.isRead && (
                <button
                  type="button"
                  title="Mark as read"
                  aria-label={`Mark ${notification.title} as read`}
                  disabled={updatingId === notification._id}
                  onClick={() => handleMarkRead(notification._id)}
                  className="notification-read-button"
                >
                  <Check size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NotificationInbox;