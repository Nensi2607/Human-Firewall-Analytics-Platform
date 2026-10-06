import api from "./api";

export const getRecommendations = async (employeeId) => {
  const response = await api.get("/recommendations", {
    params: employeeId ? { employeeId } : undefined,
  });
  return response.data;
};

export const updateRecommendationStatus = async (recommendationId, status) => {
  const response = await api.patch(`/recommendations/${recommendationId}/status`, {
    status,
  });
  return response.data;
};
