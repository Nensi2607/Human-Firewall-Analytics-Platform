import api from "./api";

export const getAdminQuizzes = async () => {
  const response = await api.get("/quizzes");
  return response.data.data;
};

export const createQuiz = async (quiz) => {
  const response = await api.post("/quizzes", quiz);
  return response.data;
};

export const createQuestion = async (quizId, question) => {
  const response = await api.post(`/questions/quiz/${quizId}`, question);
  return response.data;
};

export const getQuizQuestions = async (quizId) => {
  const response = await api.get(`/questions/quiz/${quizId}`);
  return response.data.data;
};
