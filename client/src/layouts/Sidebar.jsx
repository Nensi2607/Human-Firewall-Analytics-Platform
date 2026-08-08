import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  GraduationCap,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    path: "/employee",
    icon: Users,
  },
  {
    name: "Phishing",
    path: "#",
    icon: ShieldAlert,
  },
  {
    name: "Training",
    path: "#",
    icon: GraduationCap,
  },
  {
    name: "Analytics",
    path: "#",
    icon: BarChart3,
  },
  {
    name: "Reports",
    path: "#",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "#",
    icon: Settings,
  },
];

const Sidebar = () => {
  return (
    <aside className="w-72 min-h-screen bg-slate-900 text-white flex flex-col shadow-xl">

      {/* Logo */}

      <div className="px-6 py-8 border-b border-slate-800">

        <h1 className="text-3xl font-bold text-blue-500">
          HFAP
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Human Firewall
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 mt-6 px-3">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200
                ${
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

      {/* Logout */}

      <div className="p-5 border-t border-slate-800">

        <button
          className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 transition rounded-xl py-3 font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;