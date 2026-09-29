import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../services/notificationService";

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = getCurrentUser();
  const role = (currentUser?.role || "Employee").toString();
  const initials = `${currentUser?.firstName?.[0] || "U"}${currentUser?.lastName?.[0] || ""}`.toUpperCase();
  const fullName = currentUser
    ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
    : "User";

  useEffect(() => {
    let isActive = true;
    const refreshUnreadCount = async () => {
      try {
        const response = await getNotifications();
        if (isActive) setUnreadCount(response.unreadCount || 0);
      } catch {
        if (isActive) setUnreadCount(0);
      }
    };

    void refreshUnreadCount();
    const intervalId = window.setInterval(refreshUnreadCount, 30000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Cyber Security Awareness Dashboard</p>
        <h1>Human Firewall Analytics Platform</h1>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search size={18} className="text-gray-500" />
          <input type="text" placeholder="Search..." />
        </div>

        <button
          type="button"
          className="notification-button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          title="Notifications"
          onClick={() => navigate(currentUser?.role === "admin" ? "/notifications" : "/my/notifications")}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </button>

        <div className="profile-pill">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-meta">
            <h3>{fullName}</h3>
            <p>{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;