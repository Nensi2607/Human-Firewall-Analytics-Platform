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
    <section className="mx-auto max-w-4xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Updates
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-600">
            {unreadCount === 0 ? "You're all caught up." : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
        <p className="py-8 text-slate-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="py-8 text-slate-500">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`flex items-start justify-between gap-5 py-5 ${notification.isRead ? "" : "bg-blue-50/50 px-4"}`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                  {!notification.isRead && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">New</span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                <time className="mt-2 block text-xs text-slate-500" dateTime={notification.createdAt}>
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
                  className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-white hover:text-blue-700 disabled:opacity-50"
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