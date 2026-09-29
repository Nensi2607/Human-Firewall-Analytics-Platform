import api from "./api";

export const getEmployeeProgress = async (employeeId) => {
  const response = await api.get("/employee-progress", {
    params: employeeId ? { employeeId } : undefined,
  });
  return response.data;
};