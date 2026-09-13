import api from "./api";

export const getRiskAssessment = async () => {
  const response = await api.get("/risk-assessment");

  return response.data;
};

export const calculateRiskAssessment = async () => {
  const response = await api.post("/risk-assessment/calculate");

  return response.data;
};
