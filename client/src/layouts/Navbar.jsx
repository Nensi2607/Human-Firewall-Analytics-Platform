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
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Human Firewall Analytics Platform</h1>
        <p className="text-sm text-slate-500">Cyber Security Awareness Dashboard</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden w-72 items-center rounded-xl bg-gray-100 px-4 py-2 md:flex">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="ml-2 w-full bg-transparent text-sm outline-none"
          />
        </div>

<<<<<<< Updated upstream
        <button type="button" className="relative rounded-full p-2 transition hover:bg-gray-100">
          <Bell className="text-gray-700" size={22} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
=======
        <button
          type="button"
          className="notification-button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          title="Notifications"
          onClick={() => navigate(currentUser?.role === "admin" ? "/notifications" : "/my/notifications")}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
>>>>>>> Stashed changes
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {initials}
          </div>

          <div className="hidden md:block">
            <h3 className="font-semibold text-slate-800">{fullName}</h3>
            <p className="text-xs capitalize text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;