import { Bell, Search } from "lucide-react";

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Navbar = () => {
  const currentUser = getCurrentUser();
  const role = (currentUser?.role || "Employee").toString();
  const initials = `${currentUser?.firstName?.[0] || "U"}${currentUser?.lastName?.[0] || ""}`.toUpperCase();
  const fullName = currentUser
    ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
    : "User";

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

        <button type="button" className="notification-button">
          <Bell size={18} />
          <span className="notification-dot"></span>
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