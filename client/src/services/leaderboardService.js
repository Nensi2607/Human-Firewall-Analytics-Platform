import api from "./api";

export const getLeaderboard = async (departmentId) => {
  const response = await api.get("/leaderboard", {
    params: departmentId ? { departmentId } : undefined,
  });
  return response.data;
};