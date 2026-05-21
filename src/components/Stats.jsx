import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Stats({ habits, getToday }) {
  const today = getToday();

  function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
  }

  const last7 = getLast7Days();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#f0f0f0" } },
    },
    scales: {
      x: { ticks: { color: "#aaaaaa" }, grid: { color: "#2e2e2e" } },
      y: { ticks: { color: "#aaaaaa" }, grid: { color: "#2e2e2e" } },
    },
  };

  // Bar chart — completions per day last 7 days
  const barData = {
    labels: last7.map((d) =>
      new Date(d).toLocaleDateString([], { weekday: "short" })
    ),
    datasets: [
      {
        label: "Habits Completed",
        data: last7.map(
          (d) => habits.filter((h) => h.completedDates.includes(d)).length
        ),
        backgroundColor: "#6c63ff99",
        borderColor: "#6c63ff",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Line chart — streak over time
  const lineData = {
    labels: habits.map((h) => h.name),
    datasets: [
      {
        label: "Current Streak (days)",
        data: habits.map((h) => h.streak),
        borderColor: "#ff6584",
        backgroundColor: "#ff658422",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ff6584",
      },
    ],
  };

  // Doughnut — today's completion
  const todayDone = habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;
  const todayLeft = habits.length - todayDone;

  const doughnutData = {
    labels: ["Done", "Remaining"],
    datasets: [
      {
        data: [todayDone, todayLeft],
        backgroundColor: ["#6c63ff", "#2e2e2e"],
        borderColor: ["#6c63ff", "#2e2e2e"],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#f0f0f0" } },
    },
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">📊 Stats & Progress</h2>

      {habits.length === 0 && (
        <p className="empty">No habits to show stats for.</p>
      )}

      {habits.length > 0 && (
        <>
          {/* Doughnut - today */}
          <div className="chart-card">
            <h3>Today's Completion</h3>
            <div className="doughnut-wrap">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <p className="chart-label">{todayDone}/{habits.length} habits done</p>
          </div>

          {/* Bar chart */}
          <div className="chart-card">
            <h3>Last 7 Days</h3>
            <Bar data={barData} options={chartOptions} />
          </div>

          {/* Line chart */}
          <div className="chart-card">
            <h3>Current Streaks</h3>
            <Line data={lineData} options={chartOptions} />
          </div>

          {/* Weekly Grid */}
          <div className="stat-section">
            <h3>Weekly Overview</h3>
            <div className="weekly-grid">
              <div className="grid-header">
                {last7.map((d) => (
                  <span key={d}>
                    {new Date(d).toLocaleDateString([], { weekday: "short" })}
                  </span>
                ))}
              </div>
              {habits.map((h) => (
                <div key={h.id} className="grid-row">
                  <span className="grid-habit-name">{h.name}</span>
                  <div className="grid-dots">
                    {last7.map((d) => (
                      <span
                        key={d}
                        className={`dot ${h.completedDates.includes(d) ? "filled" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual stats */}
          {habits.map((h) => {
            const percent = Math.min(
              (h.completedDates.length / 30) * 100,
              100
            );
            const todayDone = h.completedDates.includes(today);
            return (
              <div key={h.id} className="stat-card">
                <div className="stat-card-header">
                  <h3>{h.name}</h3>
                  <span className="stat-category">{h.category}</span>
                </div>
                <div className="stat-row">
                  <div className="stat-item">
                    <span className="stat-value">🔥 {h.streak}</span>
                    <span className="stat-label">Streak</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">✅ {h.completedDates.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{todayDone ? "✅" : "❌"}</span>
                    <span className="stat-label">Today</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="progress-label">
                  {h.completedDates.length}/30 day goal — {Math.round(percent)}%
                </p>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}