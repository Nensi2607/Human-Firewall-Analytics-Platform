import api from "./api";

export const getRecommendations = async (employeeId) => {
  const response = await api.get("/recommendations", {
    params: employeeId ? { employeeId } : undefined,
  });
  return response.data;
};

export const getMyRecommendations = async () => {
  const response = await api.get("/recommendations/me");
  return response.data;
};

export const getAdminRecommendations = async () => {
  const response = await api.get("/recommendations/admin");
  return response.data;
};

export const dismissAdminRecommendation = async (recommendationId) => {
  const response = await api.patch(`/recommendations/admin/${recommendationId}/dismiss`);
  return response.data;
};

export const updateRecommendationStatus = async (recommendationId, status) => {
  const response = await api.patch(`/recommendations/${recommendationId}/status`, {
    status,
  });
  return response.data;
};
