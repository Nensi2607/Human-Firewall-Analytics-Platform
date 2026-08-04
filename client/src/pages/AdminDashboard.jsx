import DashboardCard from "../components/DashboardCard";
import RecentActivities from "../components/dashboard/RecentActivities";
import QuickActions from "../components/dashboard/QuickActions";

const AdminDashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      <p
        style={{
          color: "#6B7280",
          marginBottom: "30px",
        }}
      >
        Welcome back, Admin 👋
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
        }}
      >
        <DashboardCard
          title="Employees"
          value="250"
          color="#2563EB"
        />

        <DashboardCard
          title="Training Completed"
          value="180"
          color="#10B981"
        />

        <DashboardCard
          title="Phishing Campaigns"
          value="15"
          color="#F59E0B"
        />

        <DashboardCard
          title="Average Risk Score"
          value="72%"
          color="#EF4444"
        />

        <DashboardCard
          title="Pending Training"
          value="64"
          color="#8B5CF6"
        />

        <DashboardCard
          title="High Risk Employees"
          value="12"
          color="#DC2626"
        />
      </div>
      <RecentActivities />
      <QuickActions />
    </div>

    
  );
};

export default AdminDashboard;