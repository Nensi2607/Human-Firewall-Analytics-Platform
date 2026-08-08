import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import AdminDashboard from "../pages/AdminDashboard";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import Training from "../pages/Training";
import Quiz from "../pages/Quiz";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />

        <Route path="/training" element={<Training />} />

        {/* Quiz with ID */}
        <Route path="/training/quiz/:quizId" element={<Quiz />} />

        {/* Sample Quiz without ID */}
        <Route path="/training/quiz" element={<Quiz />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;