import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

import {
  FaUsers,
  FaBuilding,
  FaUserShield,
  FaChartLine,
} from "react-icons/fa";

import { getAdminDashboard } from "../services/dashboardService";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAdminDashboard();
      setDashboard(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DashboardLayout>
      <h1>Admin Dashboard</h1>

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
            title="Employees"
            value={dashboard.totalEmployees}
            icon={<FaUsers />}
            color="#2563eb"
          />

          <DashboardCard
            title="Departments"
            value={dashboard.totalDepartments}
            icon={<FaBuilding />}
            color="#059669"
          />

          <DashboardCard
            title="Admins"
            value={dashboard.totalAdmins}
            icon={<FaUserShield />}
            color="#dc2626"
          />

          <DashboardCard
            title="Average Risk"
            value={dashboard.averageRiskScore}
            icon={<FaChartLine />}
            color="#d97706"
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;