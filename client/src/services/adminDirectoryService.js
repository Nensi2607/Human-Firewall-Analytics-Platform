import api from "./api";

export const getEmployees = async () => {
  const response = await api.get("/users");
  return response.data.data.filter((user) => user.role === "employee");
};

export const getEmployeeDetail = async (employeeId) => {
  const response = await api.get(`/users/${employeeId}/detail`);
  return response.data;
};

export const updateEmployee = async (employeeId, employee) => {
  const response = await api.put(`/users/${employeeId}`, employee);
  return response.data.data;
};

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data.data;
};

export const createDepartment = async (department) => {
  const response = await api.post("/departments", department);
  return response.data.data;
};

export const updateDepartment = async (departmentId, department) => {
  const response = await api.put(`/departments/${departmentId}`, department);
  return response.data.data;
};

export const deleteDepartment = async (departmentId) => {
  const response = await api.delete(`/departments/${departmentId}`);
  return response.data;
};
