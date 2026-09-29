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
import Phishing from "../pages/Phishing";
import PhishingAwarenessLanding from "../pages/PhishingAwarenessLanding";
import AdminQuizManagement from "../pages/AdminQuizManagement";
import AdminPhishingCampaigns from "../pages/AdminPhishingCampaigns";
import AdminTrainingManagement from "../pages/AdminTrainingManagement";
import NotificationInbox from "../pages/NotificationInbox";
import EmployeeProgress from "../pages/EmployeeProgress";
import Leaderboard from "../pages/Leaderboard";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const isAuthenticated = () =>
  Boolean(localStorage.getItem("token")) &&
  ["admin", "employee"].includes(getStoredUser()?.role);

const getHomePath = () =>
  getStoredUser()?.role === "admin" ? "/dashboard" : "/employee";

const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const RoleRoute = ({ roles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(getStoredUser()?.role) ? (
    <Outlet />
  ) : (
    <Navigate to={getHomePath()} replace />
  );
};

const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to={getHomePath()} replace /> : <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/phishing-awareness" element={<PhishingAwarenessLanding />} />
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute roles={["admin"]} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/quizzes"
              element={<AdminQuizManagement />}
            />
            <Route
              path="/admin/training"
              element={<AdminTrainingManagement />}
            />
            <Route
              path="/admin/phishing"
              element={<AdminPhishingCampaigns />}
            />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/employee-progress" element={<EmployeeProgress />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/recommendations"
              element={
                <PlaceholderPage
                  title="Organization Recommendations"
                  description="Manage recommendations across the organization."
                />
              }
            />
            <Route
              path="/notifications"
              element={<NotificationInbox />}
            />
            <Route
              path="/reports"
              element={
                <PlaceholderPage
                  title="Organization Reports"
                  description="Generate organization-wide PDF and Excel reports."
                />
              }
            />
            <Route
              path="/departments"
              element={
                <PlaceholderPage
                  title="Departments"
                  description="Manage departments and their assignments."
                />
              }
            />
            <Route
              path="/employees"
              element={
                <PlaceholderPage
                  title="Employees"
                  description="Manage employee accounts, departments, and assignments."
                />
              }
            />
          </Route>

          <Route element={<RoleRoute roles={["employee"]} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/my/progress" element={<EmployeeProgress />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/quiz" element={<Quiz />} />
            <Route path="/phishing" element={<Phishing />} />
            <Route
              path="/risk"
              element={
                <PlaceholderPage
                  title="My Risk"
                  description="View your own risk score and security activity history."
                />
              }
            />
            <Route
              path="/my/recommendations"
              element={
                <PlaceholderPage
                  title="My Recommendations"
                  description="Review recommendations based on your security activity."
                />
              }
            />
            <Route
              path="/my/notifications"
              element={<NotificationInbox />}
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;