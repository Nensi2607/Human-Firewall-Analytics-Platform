import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

function RiskDistributionChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="analytics-panel">
        <div className="analytics-panel-header">
          <h3>Risk Distribution</h3>
        </div>
        <p className="analytics-empty">No risk distribution data available.</p>
      </div>
    );
  }

  const labels = data.map((item) => item.risk || item.riskLevel || item.label || "Unknown");
  const values = data.map((item) => Number(item.count ?? item.value ?? 0));
  const colors = ["#16a34a", "#f59e0b", "#dc2626"];

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <h3>Risk Distribution</h3>
      </div>

      <div style={{ height: 260 }}>
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default RiskDistributionChart;
