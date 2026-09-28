import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : Number(value.toFixed(2));
  }

  return value;
};

const addSectionToPdf = (doc, title, rows, options = {}) => {
  const { startY = 20 } = options;
  let y = startY;

  if (!rows || rows.length === 0) {
    return y;
  }

  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text(title, 14, y);
  y += 8;

  const headers = Object.keys(rows[0]);
  const colWidth = 190 / headers.length;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  headers.forEach((header, index) => {
    doc.text(String(header), 14 + index * colWidth, y);
  });

  y += 6;

  rows.forEach((row) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    headers.forEach((header, index) => {
      doc.text(String(formatValue(row[header])), 14 + index * colWidth, y + 6, {
        maxWidth: colWidth - 4,
      });
    });

    y += 12;
  });

  return y + 10;
};

export function downloadAnalyticsReport(data = {}) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 220, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("HFAP Security Analytics Report", 14, 12);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  y = 36;

  const overviewRows = [
    { Metric: "Total Employees", Value: formatValue(data.overview?.totalEmployees) },
    { Metric: "High Risk", Value: formatValue(data.overview?.highRisk) },
    { Metric: "Medium Risk", Value: formatValue(data.overview?.mediumRisk) },
    { Metric: "Low Risk", Value: formatValue(data.overview?.lowRisk) },
    { Metric: "Average Risk Score", Value: data.overview?.averageRiskScore != null ? `${data.overview.averageRiskScore}%` : "N/A" },
    { Metric: "Phishing Failure Rate", Value: data.overview?.phishingFailureRate != null ? `${data.overview.phishingFailureRate}%` : "N/A" },
  ];

  y = addSectionToPdf(doc, "Overall Organization Risk", overviewRows, { startY: y });

  const departmentRows = (data.departmentRisk || []).map((item) => ({
    Department: item.department || "Unassigned",
    "Average Risk": `${formatValue(item.averageRisk ?? item.averageRiskScore ?? item.riskScore ?? "N/A")}%`,
    "Employees": formatValue(item.employeeCount ?? 0),
  }));
  y = addSectionToPdf(doc, "Department Risk", departmentRows, { startY: y });

  const employeeRows = (data.employees || []).map((employee) => ({
    Employee: employee.employeeName || employee.name || "Unknown",
    Department: employee.department || "Unassigned",
    "Risk Level": employee.riskLevel || employee.level || "N/A",
    "Risk Score": `${formatValue(employee.finalRiskScore ?? employee.riskScore ?? employee.score ?? "N/A")}%`,
  }));
  y = addSectionToPdf(doc, "Employee Risk", employeeRows, { startY: y });

  const quizRows = (data.quizPerformance || []).slice(0, 20).map((item) => ({
    Employee: item.employeeName || "Unknown",
    Department: item.department || "Unassigned",
    "Attempts": formatValue(item.totalAttempts),
    "Avg Score": `${formatValue(item.averagePercentage)}%`,
    "Best Score": `${formatValue(item.bestScore)}%`,
  }));
  y = addSectionToPdf(doc, "Quiz Analysis", quizRows, { startY: y });

  const phishingRows = (data.phishingPerformance || []).slice(0, 20).map((item) => ({
    Employee: item.employeeName || "Unknown",
    Department: item.department || "Unassigned",
    "Click Rate": `${formatValue(item.clickRate)}%`,
    "Reported Rate": `${formatValue(item.reportedRate)}%`,
    "Link Click Rate": `${formatValue(item.linkClickRate)}%`,
  }));
  y = addSectionToPdf(doc, "Phishing Analysis", phishingRows, { startY: y });

  const trainingRows = (data.trainingPerformance || []).slice(0, 20).map((item) => ({
    Employee: item.employeeName || "Unknown",
    Department: item.department || "Unassigned",
    "Completed": `${formatValue(item.completedModules)}/${formatValue(item.totalModules)}`,
    "Avg Progress": `${formatValue(item.averageProgress)}%`,
    "Completion Rate": `${formatValue(item.completionRate)}%`,
  }));
  y = addSectionToPdf(doc, "Training Progress", trainingRows, { startY: y });

  const hasAIData = !!(
    data.mlPredictions &&
    ((data.mlPredictions.modelStatus && data.mlPredictions.modelStatus.available) ||
      (Array.isArray(data.mlPredictions.latestPredictions) && data.mlPredictions.latestPredictions.length > 0))
  );

  if (hasAIData) {
    const aiRows = (data.mlPredictions.latestPredictions || []).slice(0, 10).map((item) => ({
      Employee: item.employeeName || "Unknown",
      "Predicted Risk": item.predictedRisk || "N/A",
      Confidence: `${formatValue(item.confidence != null ? Number(item.confidence) * 100 : "N/A")}%`,
      "Model Version": item.modelVersion || "N/A",
    }));
    y = addSectionToPdf(doc, "AI Predictions", aiRows, { startY: y });
  }

  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  if (recommendations.length > 0) {
    const recommendationRows = recommendations.slice(0, 20).map((item) => ({
      Title: item.title || "Recommendation",
      Priority: item.priority || "N/A",
      Status: item.status || "N/A",
      Description: item.description || "N/A",
    }));
    y = addSectionToPdf(doc, "Recommendations", recommendationRows, { startY: y });
  }

  if (y > 260) {
    doc.addPage();
  }

  doc.save("hfap-security-analytics-report.pdf");

  const workbook = XLSX.utils.book_new();
  const sheets = [
    { name: "Overview", rows: overviewRows },
    { name: "DepartmentRisk", rows: departmentRows },
    { name: "EmployeeRisk", rows: employeeRows },
    { name: "QuizAnalysis", rows: quizRows },
    { name: "PhishingAnalysis", rows: phishingRows },
    { name: "TrainingProgress", rows: trainingRows },
  ];

  if (hasAIData) {
    sheets.push({ name: "AIPredictions", rows: (data.mlPredictions?.latestPredictions || []).slice(0, 20).map((item) => ({
      Employee: item.employeeName || "Unknown",
      "Predicted Risk": item.predictedRisk || "N/A",
      Confidence: item.confidence != null ? `${Number(item.confidence) * 100}%` : "N/A",
      "Model Version": item.modelVersion || "N/A",
      "Generated At": item.generatedAt || "N/A",
    })) });
  }

  if (recommendations.length > 0) {
    sheets.push({ name: "Recommendations", rows: recommendations.slice(0, 20).map((item) => ({
      Title: item.title || "Recommendation",
      Priority: item.priority || "N/A",
      Status: item.status || "N/A",
      Description: item.description || "N/A",
    })) });
  }

  sheets.forEach((sheet) => {
    if (!sheet.rows.length) {
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  });

  if (!sheets.some((sheet) => sheet.rows.length > 0)) {
    const noDataSheet = XLSX.utils.json_to_sheet([{ Note: "No analytics data available for report generation." }]);
    XLSX.utils.book_append_sheet(workbook, noDataSheet, "Summary");
  }

  XLSX.writeFile(workbook, "hfap-security-analytics-report.xlsx");
}
