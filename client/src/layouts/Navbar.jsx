import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = getCurrentUser();
  const role = (currentUser?.role || "Employee").toString();
  const initials = `${currentUser?.firstName?.[0] || "U"}${currentUser?.lastName?.[0] || ""}`.toUpperCase();
  const fullName = currentUser
    ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
    : "User";
  const pageTitle = {
    "/dashboard": "Security Overview",
    "/admin": "Security Overview",
    "/employee": "My Security Dashboard",
    "/employees": "Employee Management",
    "/departments": "Department Management",
    "/admin/quizzes": "Quiz Management",
    "/admin/training": "Training Management",
    "/admin/phishing": "Phishing Simulations",
    "/analytics": "Risk Analytics",
    "/employee-progress": "Employee Progress",
    "/my/progress": "My Progress",
    "/quiz": "Security Quiz",
    "/training": "Security Training",
    "/phishing": "Phishing Awareness",
    "/risk": "My Human Risk",
    "/recommendations": "Recommendations",
    "/my/recommendations": "My Recommendations",
    "/notifications": "Notifications",
    "/my/notifications": "My Notifications",
    "/reports": "Reports",
    "/leaderboard": "Learning Leaderboard",
    "/profile": "My Profile",
  }[pathname] || "Human Firewall Analytics Platform";

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
        <p className="eyebrow">HFAP · {role}</p>
        <h1>{pageTitle}</h1>
      </div>

      <div className="topbar-actions">
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

        <button type="button" className="profile-pill" aria-label="Open my profile" title="Open my profile" onClick={() => navigate("/profile")}>
          <div className="profile-avatar">
            <span>{initials}</span>
            {currentUser?.profileImage && <img src={currentUser.profileImage} alt="" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
          </div>
          <div className="profile-meta">
            <h3>{fullName}</h3>
            <p>{role}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;