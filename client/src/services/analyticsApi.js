import api from "./api";

async function request(endpoint, filters = {}) {
  try {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
    );
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Analytics API Error (${endpoint}):`, error);
    throw error;
  }
}

export async function getAnalyticsOverview(filters) {
  return request("/analytics/overview", filters);
}

export async function getRiskDistribution(filters) {
  return request("/analytics/risk-distribution", filters);
}

export async function getDepartmentRisk(filters) {
  return request("/analytics/department-risk", filters);
}

export async function getEmployeeRisk(filters) {
  return request("/analytics/employee-risk", filters);
}

export async function getEmployeeRiskBreakdown(filters) {
  return request("/analytics/employee-risk-breakdown", filters);
}

export async function getQuizPerformance(filters) {
  return request("/analytics/quiz-performance", filters);
}

export async function getPhishingPerformance(filters) {
  return request("/analytics/phishing-performance", filters);
}

export async function getTrainingPerformance(filters) {
  return request("/analytics/training-performance", filters);
}

export async function getDepartmentComparison(filters) {
  return request("/analytics/department-comparison", filters);
}

export async function getMLPredictions(filters) {
  return request("/analytics/ml-predictions", filters);
}