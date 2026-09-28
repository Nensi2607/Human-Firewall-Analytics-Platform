import DashboardCard from "../components/DashboardCard";
import RecentActivities from "../components/dashboard/RecentActivities";
import QuickActions from "../components/dashboard/QuickActions";

const AdminDashboard = () => {
  return (
    <div className="admin-overview-page">
      <section className="hero-panel">
        <div>
          <p className="hero-kicker">Overview</p>
          <h1>Security posture</h1>
          <p className="hero-subtitle">Welcome back, Admin</p>
        </div>

        <div className="hero-status">
          <span className="status-indicator"></span>
          Healthy
        </div>
      </section>

      <div className="stats-grid">
        <DashboardCard
          title="Employees"
          value="250"
          accent="#2563EB"
          subtitle="Total"
        />

        <DashboardCard
          title="Training"
          value="180"
          accent="#10B981"
          subtitle="Completed"
        />

        <DashboardCard
          title="Campaigns"
          value="15"
          accent="#F59E0B"
          subtitle="Live"
        />

        <DashboardCard
          title="Risk"
          value="72%"
          accent="#EF4444"
          subtitle="Average"
        />

        <DashboardCard
          title="Pending"
          value="64"
          accent="#8B5CF6"
          subtitle="Training"
        />

        <DashboardCard
          title="High Risk"
          value="12"
          accent="#DC2626"
          subtitle="Employees"
        />
      </div>

      <div className="dashboard-lower-grid">
        <RecentActivities />
        <QuickActions />
      </div>
    </div>
  );
};

export default AdminDashboard;