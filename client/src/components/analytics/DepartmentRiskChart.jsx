import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function DepartmentRiskChart({ data = [] }) {
  const labels = data.map(
    (item) =>
      item.department ||
      item.name ||
      "Unknown"
  );

  const values = data.map(
    (item) =>
      Number(
        item.averageRisk ??
        item.riskScore ??
        item.score ??
        0
      )
  );

  const chartData = {
    labels,

    datasets: [
      {
        label: "Average Risk Score",
        data: values,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3>Department-wise Risk</h3>

        <p>
          Average employee risk score by department
        </p>
      </div>

      <div className="analytics-chart-container">
        {data.length > 0 ? (
          <Bar
            data={chartData}
            options={options}
          />
        ) : (
          <div className="analytics-empty">
            No department risk data available.
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentRiskChart;