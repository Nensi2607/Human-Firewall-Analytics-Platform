import { useEffect, useState } from "react";

import StatisticsCard from "../components/analytics/StatisticsCard";
import { downloadAnalyticsReport } from "../services/reportGenerator";
import RiskDistributionChart from "../components/analytics/RiskDistributionChart";
import DepartmentRiskChart from "../components/analytics/DepartmentRiskChart";
import EmployeeRiskTable from "../components/analytics/EmployeeRiskTable";
import MLPredictionAnalytics from "../components/analytics/MLPredictionAnalytics";
import QuizPerformanceChart from "../components/analytics/QuizPerformanceChart";
import PhishingPerformanceChart from "../components/analytics/PhishingPerformanceChart";
import TrainingPerformanceChart from "../components/analytics/TrainingPerformanceChart";

import {
  getAnalyticsOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
  getEmployeeRiskBreakdown,
  getQuizPerformance,
  getPhishingPerformance,
  getTrainingPerformance,
  getDepartmentComparison,
  getMLPredictions,
} from "../services/analyticsApi";

function AnalyticsDashboard() {
  const [overview, setOverview] = useState({});
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [departmentRisk, setDepartmentRisk] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeRiskBreakdown, setEmployeeRiskBreakdown] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [phishingPerformance, setPhishingPerformance] = useState([]);
  const [trainingPerformance, setTrainingPerformance] = useState([]);
  const [departmentComparison, setDepartmentComparison] = useState([]);
  const [mlPredictions, setMLPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    setIsAdmin(user?.role === "admin");
  }, []);

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
          employeeBreakdownResponse,
          quizResponse,
          phishingResponse,
          trainingResponse,
          departmentComparisonResponse,
          mlResponse,
        ] = await Promise.all([
          getAnalyticsOverview(),
          getRiskDistribution(),
          getDepartmentRisk(),
          getEmployeeRisk(),
          getEmployeeRiskBreakdown(),
          getQuizPerformance(),
          getPhishingPerformance(),
          getTrainingPerformance(),
          getDepartmentComparison(),
          getMLPredictions(),
        ]);

        setOverview(overviewResponse?.data || overviewResponse || {});
        setRiskDistribution(riskResponse?.data || riskResponse || []);
        setDepartmentRisk(
          departmentResponse?.data || departmentResponse || []
        );
        setEmployees(employeeResponse?.data || employeeResponse || []);
        setEmployeeRiskBreakdown(
          employeeBreakdownResponse?.data || employeeBreakdownResponse || []
        );
        setQuizPerformance(quizResponse?.data || quizResponse || []);
        setPhishingPerformance(
          phishingResponse?.data || phishingResponse || []
        );
        setTrainingPerformance(
          trainingResponse?.data || trainingResponse || []
        );
        setDepartmentComparison(
          departmentComparisonResponse?.data || departmentComparisonResponse || []
        );
        setMLPredictions(mlResponse?.data || mlResponse || {});
      } catch (err) {
        console.error("Analytics loading failed:", err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const handleDownloadReport = () => {
    downloadAnalyticsReport({
      overview,
      departmentRisk,
      employees,
      quizPerformance,
      phishingPerformance,
      trainingPerformance,
      mlPredictions,
      recommendations: [],
    });
  };

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
      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">SECURITY OPERATIONS</span>
          <h1>Security Analytics</h1>
          <p>
            Monitor employee cybersecurity risk and security performance from one
            centralized dashboard.
          </p>
        </div>

        <div className="analytics-header-actions">
          <div className="analytics-header-status">
            <span className="status-dot"></span>
            Live Analytics
          </div>

          {isAdmin && (
            <button className="analytics-report-button" onClick={handleDownloadReport}>
              Download Report
            </button>
          )}
        </div>
      </div>

      <div className="analytics-stats-grid">
        <StatisticsCard
          title="Total Employees"
          value={overview.totalEmployees ?? "N/A"}
          subtitle="Registered employees"
          icon="users"
        />

        <StatisticsCard
          title="High Risk"
          value={overview.highRisk ?? "N/A"}
          subtitle="Requires immediate attention"
          icon="high-risk"
        />

        <StatisticsCard
          title="Medium Risk"
          value={overview.mediumRisk ?? "N/A"}
          subtitle="Requires monitoring"
          icon="medium-risk"
        />

        <StatisticsCard
          title="Low Risk"
          value={overview.lowRisk ?? "N/A"}
          subtitle="Currently low risk"
          icon="low-risk"
        />

        <StatisticsCard
          title="Average Risk Score"
          value={
            overview.averageRiskScore != null
              ? `${overview.averageRiskScore}%`
              : "N/A"
          }
          subtitle="Overall employee risk"
          icon="score"
        />

        <StatisticsCard
          title="Phishing Failure Rate"
          value={
            overview.phishingFailureRate != null
              ? `${overview.phishingFailureRate}%`
              : "N/A"
          }
          subtitle="Simulation performance"
          icon="phishing"
        />
      </div>

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

      <div className="analytics-section-title employee-section-title">
        <div>
          <h2>Employee Risk Analytics</h2>
          <p>
            Employee-level cybersecurity risk overview and assessment status.
          </p>
        </div>
      </div>

      <EmployeeRiskTable employees={employees} />

      <div className="analytics-section-title">
        <div>
          <h2>Performance by Category</h2>
          <p>Department and employee performance across awareness activities.</p>
        </div>
      </div>

      <div className="analytics-chart-grid">
        <QuizPerformanceChart data={quizPerformance} />
        <PhishingPerformanceChart data={phishingPerformance} />
      </div>

      <div className="analytics-chart-grid">
        <TrainingPerformanceChart data={trainingPerformance} />
        <DepartmentRiskChart
          data={departmentComparison}
          title="Department Comparison"
          valueKey="averageRiskScore"
          subtitle="Department averages"
        />
      </div>

      <MLPredictionAnalytics data={mlPredictions} />
    </div>
  );
}

export default AnalyticsDashboard;