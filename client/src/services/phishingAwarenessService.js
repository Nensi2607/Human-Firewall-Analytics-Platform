import api from "./api";

export const submitPhishingAwarenessResult = async (
  totalScenarios,
  correctAnswers
) => {
  const response = await api.post("/phishing-awareness", {
    totalScenarios,
    correctAnswers,
  });

  return response.data;
};

export const getPhishingAwarenessResult = async () => {
  const response = await api.get("/phishing-awareness");

  return response.data;
};
