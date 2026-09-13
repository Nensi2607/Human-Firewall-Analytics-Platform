import api from "./api";

export const getTrainings = async () => {
  const response = await api.get("/training");

  return response.data;
};

export const getTrainingProgress = async () => {
  const response = await api.get("/training-progress");

  return response.data;
};

export const completeTraining = async (trainingId) => {
  const response = await api.post(`/training-progress/${trainingId}`, {
    progress: 100,
    completed: true,
  });

  return response.data;
};