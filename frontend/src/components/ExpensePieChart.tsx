import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function ExpensePieChart({ expenses, chartSize = 180 }) {
  if (!expenses || expenses.length === 0) return <p>No data yet.</p>;

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalAmount === 0) return <p>No meaningful data.</p>;

  
  const colors = [
    "#8A45FF", 
    "#FF007F",
    "#00D1FF",
    "#FFE600",
    "#FF5733",
    "#3B82F6",
    "#10B981",
    "#F59E0B"
  ];

  return (
    <div style={{ maxWidth: chartSize, height: chartSize, margin: "auto" }}>
      <Pie
        data={{
          labels: expenses.map(e => e.category),
          datasets: [
            {
              data: expenses.map(e => e.amount),
              backgroundColor: expenses.map((_, i) => colors[i % colors.length]),
              borderColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              hoverOffset: 8,
            }
          ]
        }}
        options={{
          plugins: {
            legend: { labels: { color: "#fff" } },
            datalabels: {
              formatter: value => `${((value / totalAmount) * 100).toFixed(1)}%`,
              color: "#fff",
              font: { weight: "bold", size: 14 }
            }
          },
          animation: {
            duration: 900,
            easing: "easeOutQuart"
          },
          maintainAspectRatio: false,
          responsive: true,
        }}
      />
    </div>
  );
}
