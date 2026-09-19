import api from "./api";

export const getEmployees = async () => {
  const response = await api.get("/users");
  return response.data.data.filter((user) => user.role === "employee");
};

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data.data;
};
