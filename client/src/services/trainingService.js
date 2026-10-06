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
  });

  return response.data;
};

export const createTraining = async (training) => {
  const response = await api.post("/training", training);
  return response.data;
};

export const updateTraining = async (trainingId, training) => {
  const response = await api.put(`/training/${trainingId}`, training);
  return response.data;
};

export const deleteTraining = async (trainingId) => {
  const response = await api.delete(`/training/${trainingId}`);
  return response.data;
};