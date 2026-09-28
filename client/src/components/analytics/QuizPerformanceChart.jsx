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

function QuizPerformanceChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="analytics-panel">
        <div className="analytics-panel-header">
          <h3>Quiz Performance</h3>
        </div>
        <p className="analytics-empty">No quiz performance data available.</p>
      </div>
    );
  }

  const labels = data.slice(0, 8).map((item) => item.employeeName || "Employee");
  const values = data.slice(0, 8).map((item) => Number(item.averagePercentage ?? 0));

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <h3>Quiz Performance</h3>
      </div>

      <div style={{ height: 260 }}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Average Quiz Score (%)",
                data: values,
                backgroundColor: "#2563eb",
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

export default QuizPerformanceChart;
