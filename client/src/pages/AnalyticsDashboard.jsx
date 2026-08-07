import { useEffect, useState } from "react";

import StatisticsCard from "../components/analytics/StatisticsCard";
import RiskDistributionChart from "../components/analytics/RiskDistributionChart";
import DepartmentRiskChart from "../components/analytics/DepartmentRiskChart";
import EmployeeRiskTable from "../components/analytics/EmployeeRiskTable";

import {
  getAnalyticsOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
} from "../services/analyticsApi";

function AnalyticsDashboard() {
  const [overview, setOverview] = useState({});
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [departmentRisk, setDepartmentRisk] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [
          overviewResponse,
          riskResponse,
          departmentResponse,
          employeeResponse,
        ] = await Promise.all([
          getAnalyticsOverview(),
          getRiskDistribution(),
          getDepartmentRisk(),
          getEmployeeRisk(),
        ]);

        setOverview(overviewResponse?.data || overviewResponse || {});
        setRiskDistribution(riskResponse?.data || riskResponse || []);
        setDepartmentRisk(
          departmentResponse?.data || departmentResponse || []
        );
        setEmployees(employeeResponse?.data || employeeResponse || []);
      } catch (err) {
        console.error("Analytics loading failed:", err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>
          <p>Loading security analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <div className="error-icon">!</div>
          <h2>Analytics Unavailable</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            SECURITY OPERATIONS
          </span>

          <h1>Security Analytics</h1>

          <p>
            Monitor employee cybersecurity risk and security
            performance from one centralized dashboard.
          </p>
        </div>

        <div className="analytics-header-status">
          <span className="status-dot"></span>
          Live Analytics
        </div>
      </div>

      {/* Statistics */}
      <div className="analytics-stats-grid">
        <StatisticsCard
          title="Total Employees"
          value={overview.totalEmployees ?? 0}
          subtitle="Registered employees"
          icon="users"
        />

        <StatisticsCard
          title="High Risk"
          value={overview.highRisk ?? 0}
          subtitle="Requires immediate attention"
          icon="high-risk"
        />

        <StatisticsCard
          title="Medium Risk"
          value={overview.mediumRisk ?? 0}
          subtitle="Requires monitoring"
          icon="medium-risk"
        />

        <StatisticsCard
          title="Low Risk"
          value={overview.lowRisk ?? 0}
          subtitle="Currently low risk"
          icon="low-risk"
        />

        <StatisticsCard
          title="Average Risk Score"
          value={
            overview.averageRiskScore != null
              ? `${overview.averageRiskScore}%`
              : "0%"
          }
          subtitle="Overall employee risk"
          icon="score"
        />

        <StatisticsCard
          title="Phishing Failure Rate"
          value={
            overview.phishingFailureRate != null
              ? `${overview.phishingFailureRate}%`
              : "0%"
          }
          subtitle="Simulation performance"
          icon="phishing"
        />
      </div>

      {/* Charts */}
      <div className="analytics-section-title">
        <div>
          <h2>Risk Overview</h2>
          <p>Understand cybersecurity risk across your organization.</p>
        </div>
      </div>

      <div className="analytics-chart-grid">
        <RiskDistributionChart data={riskDistribution} />
        <DepartmentRiskChart data={departmentRisk} />
      </div>

      {/* Employee Table */}
      <div className="analytics-section-title employee-section-title">
        <div>
          <h2>Employee Risk Analytics</h2>
          <p>
            Employee-level cybersecurity risk overview and
            assessment status.
          </p>
        </div>
      </div>

      <EmployeeRiskTable employees={employees} />
    </div>
  );
}

export default AnalyticsDashboard;