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

export const submitQuizResult = async (result) => {
  const response = await api.post("/quiz-results", result);

  return response.data;
};