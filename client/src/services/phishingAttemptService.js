import api from "./api";

export const getMyPhishingAttempts = async () => {
  const response = await api.get("/phishing/attempts/me");
  return response.data;
};

export const reportPhishingAttempt = async (attemptId) => {
  const response = await api.patch(`/phishing/attempts/${attemptId}/report`);
  return response.data;
};