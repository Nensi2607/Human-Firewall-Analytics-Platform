import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";

import AdminDashboard from "../pages/AdminDashboard";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";
import PlaceholderPage from "../pages/PlaceholderPage";

import Quiz from "../pages/Quiz";
import Training from "../pages/Training";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const isAuthenticated = () => Boolean(localStorage.getItem("token")) && Boolean(getStoredUser());

const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />

          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/training" element={<Training />} />

          <Route
            path="/phishing"
            element={
              <PlaceholderPage
                title="Phishing"
                description="Review upcoming phishing simulations, campaign history, and employee targeting insights."
              />
            }
          />
          <Route
            path="/risk"
            element={
              <PlaceholderPage
                title="Risk"
                description="Track employee security posture, risk scoring trends, and intervention recommendations."
              />
            }
          />
          <Route
            path="/analytics"
            element={<AnalyticsDashboard />}
          />
          <Route
            path="/recommendations"
            element={
              <PlaceholderPage
                title="Recommendations"
                description="Surface action-oriented guidance for security training, phishing defense, and awareness improvements."
              />
            }
          />
          <Route
            path="/notifications"
            element={
              <PlaceholderPage
                title="Notifications"
                description="Manage compliance alerts, system notices, and employee communications within the security program."
              />
            }
          />
          <Route
            path="/reports"
            element={
              <PlaceholderPage
                title="Reports"
                description="Generate summary reports for leadership, training completion, phishing engagement, and organizational risk."
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;