import { useEffect, useState } from "react";
import { downloadAnalyticsReport } from "../services/reportGenerator";
import { getRecommendations } from "../services/recommendationService";
import {
  getAnalyticsOverview,
  getDepartmentRisk,
  getEmployeeRisk,
  getMLPredictions,
  getPhishingPerformance,
  getQuizPerformance,
  getTrainingPerformance,
} from "../services/analyticsApi";

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const loadReportData = async () => {
      try {
        const [overview, departmentRisk, employees, quizPerformance, phishingPerformance, trainingPerformance, mlPredictions, recommendations] = await Promise.all([
          getAnalyticsOverview(),
          getDepartmentRisk(),
          getEmployeeRisk(),
          getQuizPerformance(),
          getPhishingPerformance(),
          getTrainingPerformance(),
          getMLPredictions(),
          getRecommendations(),
        ]);
        if (!isActive) return;
        setReportData({
          overview: overview.data || {},
          departmentRisk: departmentRisk.data || [],
          employees: employees.data || [],
          quizPerformance: quizPerformance.data || [],
          phishingPerformance: phishingPerformance.data || [],
          trainingPerformance: trainingPerformance.data || [],
          mlPredictions: mlPredictions.data || {},
          recommendations: recommendations.data || [],
        });
      } catch (requestError) {
        if (isActive) setError(requestError.response?.data?.message || "Unable to prepare the report.");
      } finally {
        if (isActive) setLoading(false);
      }
    };
    void loadReportData();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="reports-page-shell">
      <header className="reports-page-header">
        <p className="section-kicker">Reporting</p>
        <h1 className="reports-page-title">Organization Reports</h1>
        <p className="reports-page-copy">Generate a report from the current analytics, AI prediction, and recommendation data.</p>
      </header>
      {loading && <p className="reports-loading">Preparing report data...</p>}
      {error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}
      {!loading && !error && reportData && (
        <div className="report-summary-card">
          <p className="report-summary-text">{reportData.employees.length} employee records, {reportData.recommendations.length} recommendations, and current model results are ready.</p>
          <button
            type="button"
            onClick={() => downloadAnalyticsReport(reportData)}
            className="report-download-button"
          >
            Download PDF and Excel reports
          </button>
        </div>
      )}
    </section>
  );
};

export default Reports;
