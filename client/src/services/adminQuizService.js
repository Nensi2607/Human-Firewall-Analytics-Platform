import api from "./api";

export const getAdminQuizzes = async () => {
  const response = await api.get("/quizzes");
  return response.data.data;
};

export const createQuiz = async (quiz) => {
  const response = await api.post("/quizzes", quiz);
  return response.data;
};

export const updateQuiz = async (quizId, quiz) => {
  const response = await api.put(`/quizzes/${quizId}`, quiz);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/quizzes/${quizId}`);
  return response.data;
};

export const createQuestion = async (quizId, question) => {
  const response = await api.post(`/questions/quiz/${quizId}`, question);
  return response.data;
};

export const updateQuestion = async (questionId, question) => {
  const response = await api.put(`/questions/${questionId}`, question);
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/questions/${questionId}`);
  return response.data;
};

export const getQuizQuestions = async (quizId) => {
  const response = await api.get(`/questions/quiz/${quizId}`);
  return response.data.data;
};
