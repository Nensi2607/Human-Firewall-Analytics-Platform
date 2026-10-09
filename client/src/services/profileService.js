import api from "./api";

const dataOf = (response) => response.data?.data;

export const getMyProfile = async () => dataOf(await api.get("/users/me"));

export const updateMyProfile = async (profile) => dataOf(await api.patch("/users/me", profile));

export const changeMyPassword = async (passwords) => api.patch("/users/me/password", passwords);

export const getMyAdminSummary = async () => dataOf(await api.get("/users/me/admin-summary"));

export const getMyRiskAssessment = async () => dataOf(await api.get("/risk-assessment"));

export const getMyAssignedQuizzes = async () => dataOf(await api.get("/quizzes"));

export const getMyQuizResultsForProfile = async () => dataOf(await api.get("/quiz-results/me"));

export const getMyTrainings = async () => dataOf(await api.get("/training"));

export const getMyTrainingProgress = async () => dataOf(await api.get("/training-progress"));

export const getMyPhishingHistory = async () => dataOf(await api.get("/phishing/attempts/me"));

export const getMyTopRecommendations = async () => dataOf(await api.get("/recommendations/me"));
