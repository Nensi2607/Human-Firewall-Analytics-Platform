import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/dashboard",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAdminDashboard = async () => {
  const res = await API.get("/admin");
  return res.data;
};

export const getEmployeeDashboard = async () => {
  const res = await API.get("/employee");
  return res.data;
};