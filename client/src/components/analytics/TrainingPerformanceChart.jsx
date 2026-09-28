import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function TrainingPerformanceChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="analytics-panel">
        <div className="analytics-panel-header">
          <h3>Training Completion</h3>
        </div>
        <p className="analytics-empty">No training performance data available.</p>
      </div>
    );
  }

  const labels = data.slice(0, 8).map((item) => item.employeeName || "Employee");
  const values = data.slice(0, 8).map((item) => Number(item.completionRate ?? 0));

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <h3>Training Completion</h3>
      </div>

      <div style={{ height: 260 }}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Completion Rate (%)",
                data: values,
                backgroundColor: "#22c55e",
                borderRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (value) => `${value}%` },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default TrainingPerformanceChart;
