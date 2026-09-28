import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

const adminMenuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quiz Management",
    path: "/admin/quizzes",
    icon: ClipboardList,
  },
  {
    name: "Training Management",
    path: "/admin/training",
    icon: GraduationCap,
  },
  {
    name: "Phishing Campaigns",
    path: "/admin/phishing",
    icon: ShieldAlert,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Recommendations",
    path: "/recommendations",
    icon: FileText,
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Departments",
    path: "/departments",
    icon: Building2,
  },
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
];

const employeeMenuItems = [
  {
    name: "Dashboard",
    path: "/employee",
    icon: LayoutDashboard,
  },
  {
    name: "Quizzes",
    path: "/quiz",
    icon: Target,
  },
  {
    name: "Training",
    path: "/training",
    icon: GraduationCap,
  },
  {
    name: "Phishing Awareness",
    path: "/phishing",
    icon: ShieldAlert,
  },
  {
    name: "My Risk",
    path: "/risk",
    icon: Sparkles,
  },
  {
    name: "My Recommendations",
    path: "/my/recommendations",
    icon: FileText,
  },
  {
    name: "My Notifications",
    path: "/my/notifications",
    icon: Bell,
  },
  {
    name: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
  },
];

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = getCurrentUser()?.role === "admin"
    ? adminMenuItems
    : employeeMenuItems;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">HF</div>
        <div>
          <h1>HFAP</h1>
          <p>Human Firewall</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;