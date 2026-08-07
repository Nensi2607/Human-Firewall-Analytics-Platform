const API_BASE_URL = "/api";

async function request(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
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