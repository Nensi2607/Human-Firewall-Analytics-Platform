import React from "react";
import StatCard from "../components/dashboard/StatCard";

import {
  Users,
  Building2,
  ShieldAlert,
  Brain,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">

      {/* Navbar */}

      <header className="h-20 border-b border-slate-800 flex justify-between items-center px-10">

        <div>

          <h1 className="text-3xl font-bold text-cyan-400">
            HFAP
          </h1>

          <p className="text-slate-400 text-sm">
            Human Firewall Analytics Platform
          </p>

        </div>

        <div className="flex items-center gap-5">

          <button className="text-2xl hover:scale-110 duration-300">
            🔔
          </button>

          <img
            src="https://i.pravatar.cc/45"
            alt=""
            className="rounded-full border-2 border-cyan-400"
          />

        </div>

      </header>

      <div className="flex">

        {/* Sidebar */}

        <aside className="w-72 min-h-screen bg-[#111827] border-r border-slate-800 p-7">

          <h2 className="uppercase text-xs tracking-widest text-slate-500 mb-8">
            Navigation
          </h2>

          <div className="space-y-3">

            {[
              "🏠 Dashboard",
              "👥 Employees",
              "🏢 Departments",
              "🎓 Training",
              "📝 Quiz",
              "🎣 Phishing",
              "🛡 Risk Assessment",
              "🤖 AI Prediction",
              "📊 Reports",
              "⚙ Settings",
            ].map((item) => (

              <button
                key={item}
                className="w-full text-left rounded-xl px-4 py-3
                hover:bg-slate-800 duration-300"
              >
                {item}
              </button>

            ))}

          </div>

        </aside>

        {/* Main */}

        <main className="flex-1 p-10">

          <h1 className="text-5xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="text-slate-400 mt-3">
            Monitor your organization's cyber awareness from one place.
          </p>

          {/* Cards */}

          <div className="grid grid-cols-4 gap-7 mt-12">

            <StatCard
              title="Employees"
              value="245"
              subtitle="+12 this month"
              icon={<Users />}
              color="bg-blue-500"
            />

            <StatCard
              title="Departments"
              value="12"
              subtitle="Organization Units"
              icon={<Building2 />}
              color="bg-green-500"
            />

            <StatCard
              title="Average Risk"
              value="31%"
              subtitle="Low Risk"
              icon={<ShieldAlert />}
              color="bg-yellow-500"
            />

            <StatCard
              title="AI Accuracy"
              value="97%"
              subtitle="Prediction Engine"
              icon={<Brain />}
              color="bg-purple-500"
            />

          </div>

          {/* Charts */}

          <div className="grid grid-cols-2 gap-8 mt-10">

            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 h-96 flex items-center justify-center">

              <h2 className="text-slate-400 text-xl">
                📈 Risk Trend Chart
              </h2>

            </div>

            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 h-96 flex items-center justify-center">

              <h2 className="text-slate-400 text-xl">
                📊 Department Analytics
              </h2>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Dashboard;