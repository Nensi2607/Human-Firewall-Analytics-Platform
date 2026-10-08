import DashboardCard from "../components/DashboardCard";
import RecentActivities from "../components/dashboard/RecentActivities";
import QuickActions from "../components/dashboard/QuickActions";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/dashboardService";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminDashboard();
        if (isActive) setDashboard(response.data);
      } catch {
        if (isActive) {
          setDashboard(null);
          setError("Unable to load organization metrics.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      isActive = false;
    };
  }, [retryCount]);

  return (
    <div className="employee-dashboard-shell admin-overview-page">
      <section className="employee-dashboard-intro">
        <div>
          <p className="section-kicker">Overview</p>
          <h1>Security posture</h1>
        </div>

        <div className="security-status-pill">
          <span className="status-indicator"></span>
          Database snapshot
        </div>
      </section>

      {loading ? (
        <p role="status" className="dashboard-state">Loading organization metrics...</p>
      ) : error ? (
        <div className="state-card error-card" role="alert">
          <h3>{error}</h3>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      ) : dashboard ? (
      <>
      <div className="stats-grid">
        <DashboardCard
          title="Employees"
          value={dashboard?.totalEmployees ?? "N/A"}
          accent="#2563EB"
          subtitle="Total"
        />

        <DashboardCard
          title="Training"
          value={dashboard?.completedTrainings ?? "N/A"}
          accent="#10B981"
          subtitle="Completed"
        />

        <DashboardCard
          title="Campaigns"
          value={dashboard?.campaignCount ?? "N/A"}
          accent="#F59E0B"
          subtitle="Created"
        />

        <DashboardCard
          title="Risk"
          value={dashboard?.averageRiskScore == null ? "N/A" : `${dashboard.averageRiskScore}%`}
          accent="#EF4444"
          subtitle="Average"
        />

        <DashboardCard
          title="Pending"
          value={dashboard?.pendingTrainings ?? "N/A"}
          accent="#8B5CF6"
          subtitle="Training"
        />

        <DashboardCard
          title="High Risk"
          value={dashboard?.highRiskEmployees ?? "N/A"}
          accent="#DC2626"
          subtitle="Employees"
        />
      </div>

      <div className="dashboard-lower-grid">
        <RecentActivities />
        <QuickActions />
      </div>
      </>
      ) : (
        <p className="dashboard-state">No organization metrics are available.</p>
      )}
    </div>
  );
};

export default AdminDashboard;