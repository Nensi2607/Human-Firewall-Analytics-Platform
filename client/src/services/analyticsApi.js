import api from "./api";

async function request(endpoint) {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Analytics API Error (${endpoint}):`, error);
    throw error;
  }
}

export async function getAnalyticsOverview() {
  return request("/analytics/overview");
}

export async function getRiskDistribution() {
  return request("/analytics/risk-distribution");
}

export async function getDepartmentRisk() {
  return request("/analytics/department-risk");
}

export async function getEmployeeRisk() {
  return request("/analytics/employee-risk");
}

export async function getEmployeeRiskBreakdown() {
  return request("/analytics/employee-risk-breakdown");
}

export async function getQuizPerformance() {
  return request("/analytics/quiz-performance");
}

export async function getPhishingPerformance() {
  return request("/analytics/phishing-performance");
}

export async function getTrainingPerformance() {
  return request("/analytics/training-performance");
}

export async function getDepartmentComparison() {
  return request("/analytics/department-comparison");
}

export async function getMLPredictions() {
  return request("/analytics/ml-predictions");
}