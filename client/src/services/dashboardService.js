import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/dashboard`,
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