import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Registration Page */}
      <Route path="/register" element={<Register />} />

      {/* Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        {/* ORIGINAL DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Role Based Dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={<AnalyticsDashboard />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;