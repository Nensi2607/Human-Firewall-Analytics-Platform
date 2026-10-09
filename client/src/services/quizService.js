import api from "./api";

export const getAllQuizzes = async () => {
  const response = await api.get("/quizzes");

  return response.data.data;
};

export const getQuizQuestions = async (quizId) => {
  const response = await api.get(
    `/questions/quiz/${quizId}`
  );

  return response.data.data;
};

export const getQuizDetails = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data.data;
};

export const submitQuizResult = async (result) => {
  const response = await api.post("/quiz-results", result);

  return response.data;
};

export const getMyQuizResults = async () => {
  const response = await api.get("/quiz-results/me");
  return response.data.data;
};