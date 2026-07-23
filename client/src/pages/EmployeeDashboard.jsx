import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

import {
  FaUser,
  FaGraduationCap,
  FaClipboardCheck,
  FaShieldAlt,
} from "react-icons/fa";

import { getEmployeeDashboard } from "../services/dashboardService";

const EmployeeDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getEmployeeDashboard();
      setDashboard(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DashboardLayout>
      <h1>Employee Dashboard</h1>

      {!dashboard ? (
        <h3>Loading...</h3>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <DashboardCard
            title="Employee"
            value={dashboard.employee.firstName}
            icon={<FaUser />}
            color="#2563eb"
          />

          <DashboardCard
            title="Completed Trainings"
            value={dashboard.completedTrainings}
            icon={<FaGraduationCap />}
            color="#059669"
          />

          <DashboardCard
            title="Quizzes"
            value={dashboard.quizzesCompleted}
            icon={<FaClipboardCheck />}
            color="#d97706"
          />

          <DashboardCard
            title="Risk Score"
            value={dashboard.riskScore}
            icon={<FaShieldAlt />}
            color="#dc2626"
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;