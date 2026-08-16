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

        <button type="button" className="relative rounded-full p-2 transition hover:bg-gray-100">
          <Bell className="text-gray-700" size={22} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
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