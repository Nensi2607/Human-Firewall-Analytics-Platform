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
    <aside className="flex min-h-screen w-72 flex-col bg-slate-900 text-white shadow-xl">
      <div className="border-b border-slate-800 px-6 py-8">
        <h1 className="text-3xl font-bold text-blue-500">HFAP</h1>
        <p className="mt-1 text-sm text-slate-400">Human Firewall</p>
      </div>

      <nav className="mt-6 flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-semibold transition hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;