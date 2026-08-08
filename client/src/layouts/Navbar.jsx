import { Bell, Search } from "lucide-react";

const Navbar = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">

      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Human Firewall Analytics Platform
        </h1>

        <p className="text-sm text-slate-500">
          Cyber Security Awareness Dashboard
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-72">

          <Search size={18} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />

        </div>

        {/* Notification */}

        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">

          <Bell className="text-gray-700" size={22} />

          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        {/* Profile */}

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            A
          </div>

          <div className="hidden md:block">

            <h3 className="font-semibold text-slate-800">
              Admin
            </h3>

            <p className="text-xs text-gray-500">
              System Administrator
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;