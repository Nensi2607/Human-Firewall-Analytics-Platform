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
    <section className="mx-auto max-w-4xl">
      <header className="mb-7 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Reporting</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Organization Reports</h1>
        <p className="mt-2 text-slate-600">Generate a report from the current analytics, AI prediction, and recommendation data.</p>
      </header>
      {loading && <p className="py-8 text-slate-500">Preparing report data...</p>}
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && reportData && (
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm text-slate-600">{reportData.employees.length} employee records, {reportData.recommendations.length} recommendations, and current model results are ready.</p>
          <button
            type="button"
            onClick={() => downloadAnalyticsReport(reportData)}
            className="mt-5 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Download PDF and Excel reports
          </button>
        </div>
      )}
    </section>
  );
};

export default Reports;
