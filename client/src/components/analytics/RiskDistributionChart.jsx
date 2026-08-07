import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function RiskDistributionChart({ data = [] }) {
  const labels = data.map(
    (item) => item.risk || item.label || "Unknown"
  );

  const values = data.map(
    (item) => Number(item.count ?? item.value ?? 0)
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3>Employee Risk Distribution</h3>

        <p>
          Distribution of employees by risk level
        </p>
      </div>

      <div className="analytics-chart-container">
        {data.length > 0 ? (
          <Doughnut
            data={chartData}
            options={options}
          />
        ) : (
          <div className="analytics-empty">
            No risk distribution data available.
          </div>
        )}
      </div>
    </div>
  );
}

export default RiskDistributionChart;