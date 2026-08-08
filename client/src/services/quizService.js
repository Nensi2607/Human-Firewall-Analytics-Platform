import axios from "axios";

const API_URL =
  "https://fluffy-space-barnacle-x5grj7jv9gvx36p76-5000.app.github.dev/api";

export const getAllQuizzes = async () => {
  const response = await axios.get(`${API_URL}/quizzes`);

  return response.data.data;
};

export const getQuizQuestions = async (quizId) => {
  const response = await axios.get(
    `${API_URL}/questions/${quizId}`
  );

  return response.data.data;
};