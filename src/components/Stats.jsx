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

  return (
    <div className="tab-content">
      <h2 className="tab-title">📊 Stats & Progress</h2>

      {habits.length === 0 && <p className="empty">No habits to show stats for.</p>}

      {/* Weekly Grid */}
      {habits.length > 0 && (
        <div className="stat-section">
          <h3>Weekly Overview</h3>
          <div className="weekly-grid">
            <div className="grid-header">
              {last7.map((d) => (
                <span key={d}>{new Date(d).toLocaleDateString([], { weekday: "short" })}</span>
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
      )}

      {/* Individual habit stats */}
      {habits.map((h) => {
        const percent = Math.min((h.completedDates.length / 30) * 100, 100);
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
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">✅ {h.completedDates.length}</span>
                <span className="stat-label">Total Days</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{todayDone ? "✅" : "❌"}</span>
                <span className="stat-label">Today</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <p className="progress-label">{h.completedDates.length}/30 day goal — {Math.round(percent)}%</p>
          </div>
        );
      })}
    </div>
  );
}