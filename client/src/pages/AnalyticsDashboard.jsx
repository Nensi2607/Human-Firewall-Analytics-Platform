import { useEffect, useState } from "react";

import StatisticsCard from "../components/analytics/StatisticsCard";
import DepartmentRiskChart from "../components/analytics/DepartmentRiskChart";
import EmployeeRiskTable from "../components/analytics/EmployeeRiskTable";
import MLPredictionAnalytics from "../components/analytics/MLPredictionAnalytics";
import PhishingPerformanceChart from "../components/analytics/PhishingPerformanceChart";
import QuizPerformanceChart from "../components/analytics/QuizPerformanceChart";
import RiskDistributionChart from "../components/analytics/RiskDistributionChart";
import TrainingPerformanceChart from "../components/analytics/TrainingPerformanceChart";
import { getDepartments } from "../services/adminDirectoryService";
import { downloadAnalyticsReport } from "../services/reportGenerator";
import { getRecommendations } from "../services/recommendationService";
import {
  getAnalyticsOverview,
  getDepartmentComparison,
  getDepartmentRisk,
  getEmployeeRisk,
  getMLPredictions,
  getPhishingPerformance,
  getQuizPerformance,
  getRiskDistribution,
  getTrainingPerformance,
} from "../services/analyticsApi";

function AnalyticsDashboard() {
  const emptyFilters = {
    employee: "",
    departmentId: "",
    riskLevel: "",
    minQuizPercentage: "",
    maxQuizPercentage: "",
    trainingStatus: "",
    phishingResult: "",
  };
  const [overview, setOverview] = useState({});
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [departmentRisk, setDepartmentRisk] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [phishingPerformance, setPhishingPerformance] = useState([]);
  const [trainingPerformance, setTrainingPerformance] = useState([]);
  const [departmentComparison, setDepartmentComparison] = useState([]);
  const [mlPredictions, setMLPredictions] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.role === "admin";
    } catch {
      return false;
    }
  });
  const [departments, setDepartments] = useState([]);
  const [filterDraft, setFilterDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    let isActive = true;
    void getDepartments()
      .then((response) => {
        if (isActive) setDepartments(response);
      })
      .catch(() => {
        if (isActive) setDepartments([]);
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [
          overviewResponse,
          riskResponse,
          departmentResponse,
          employeeResponse,
          quizResponse,
          phishingResponse,
          trainingResponse,
          departmentComparisonResponse,
          mlResponse,
          recommendationsResponse,
        ] = await Promise.all([
          getAnalyticsOverview(appliedFilters),
          getRiskDistribution(appliedFilters),
          getDepartmentRisk(appliedFilters),
          getEmployeeRisk(appliedFilters),
          getQuizPerformance(appliedFilters),
          getPhishingPerformance(appliedFilters),
          getTrainingPerformance(appliedFilters),
          getDepartmentComparison(appliedFilters),
          getMLPredictions(appliedFilters),
          getRecommendations(),
        ]);

        if (!isActive) return;

        setOverview(overviewResponse?.data || overviewResponse || {});
        setRiskDistribution(riskResponse?.data || riskResponse || []);
        setDepartmentRisk(departmentResponse?.data || departmentResponse || []);
        setEmployees(employeeResponse?.data || employeeResponse || []);
        setQuizPerformance(quizResponse?.data || quizResponse || []);
        setPhishingPerformance(phishingResponse?.data || phishingResponse || []);
        setTrainingPerformance(trainingResponse?.data || trainingResponse || []);
        setDepartmentComparison(
          departmentComparisonResponse?.data || departmentComparisonResponse || []
        );
        setMLPredictions(mlResponse?.data || mlResponse || {});
        setRecommendations(recommendationsResponse?.data || recommendationsResponse || []);
      } catch (err) {
        console.error("Analytics loading failed:", err);
        if (isActive) setError("Unable to load analytics data.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadAnalytics();
    return () => {
      isActive = false;
    };
  }, [appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterDraft((current) => ({ ...current, [name]: value }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(
      Object.fromEntries(
        Object.entries(filterDraft).filter(([, value]) => value !== "")
      )
    );
  };

  const handleResetFilters = () => {
    setFilterDraft(emptyFilters);
    setAppliedFilters({});
  };

  const handleDownloadReport = () => {
    downloadAnalyticsReport({
      overview,
      departmentRisk,
      employees,
      quizPerformance,
      phishingPerformance,
      trainingPerformance,
      mlPredictions,
      recommendations,
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
          <button onClick={() => window.location.reload()}>Try Again</button>
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

      <form
        onSubmit={handleApplyFilters}
        className="mb-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-sm font-semibold text-slate-700">
          Employee
          <input
            name="employee"
            type="search"
            value={filterDraft.employee}
            onChange={handleFilterChange}
            placeholder="Name or email"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Department
          <select
            name="departmentId"
            value={filterDraft.departmentId}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.departmentName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Risk level
          <select
            name="riskLevel"
            value={filterDraft.riskLevel}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">All risk levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <fieldset className="text-sm font-semibold text-slate-700">
          <legend>Average quiz score (%)</legend>
          <div className="mt-1 flex items-center gap-2">
            <input
              name="minQuizPercentage"
              type="number"
              min="0"
              max="100"
              value={filterDraft.minQuizPercentage}
              onChange={handleFilterChange}
              placeholder="Min"
              aria-label="Minimum average quiz score"
              className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
            />
            <span aria-hidden="true">to</span>
            <input
              name="maxQuizPercentage"
              type="number"
              min="0"
              max="100"
              value={filterDraft.maxQuizPercentage}
              onChange={handleFilterChange}
              placeholder="Max"
              aria-label="Maximum average quiz score"
              className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
            />
          </div>
        </fieldset>
        <label className="text-sm font-semibold text-slate-700">
          Training status
          <select
            name="trainingStatus"
            value={filterDraft.trainingStatus}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">All training statuses</option>
            <option value="completed">Completed all</option>
            <option value="in-progress">In progress</option>
            <option value="not-started">Not started</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Phishing result
          <select
            name="phishingResult"
            value={filterDraft.phishingResult}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">All results</option>
            <option value="clicked">Clicked or entered credentials</option>
            <option value="reported">Reported</option>
            <option value="no-click">Attempted, no click</option>
            <option value="no-attempt">No simulation attempt</option>
          </select>
        </label>
        <div className="flex items-end gap-2 lg:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>

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
          value={overview.averageRiskScore != null ? `${overview.averageRiskScore}%` : "N/A"}
          subtitle="Overall employee risk"
          icon="score"
        />
        <StatisticsCard
          title="Phishing Failure Rate"
          value={overview.phishingFailureRate != null ? `${overview.phishingFailureRate}%` : "N/A"}
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
          <p>Employee-level cybersecurity risk overview and assessment status.</p>
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
