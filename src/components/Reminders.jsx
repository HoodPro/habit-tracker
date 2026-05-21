import { useState, useEffect } from "react";

export default function Reminders({ habits, setReminder }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [triggered, setTriggered] = useState({});

  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      habits.forEach((h) => {
        if (
          h.reminder === currentTime &&
          !triggered[`${h.id}-${currentTime}`] &&
          permission === "granted"
        ) {
          new Notification(`⏰ Habit Reminder`, {
            body: `Time to do: ${h.name}!`,
            icon: "/favicon.ico",
          });
          setTriggered((prev) => ({ ...prev, [`${h.id}-${currentTime}`]: true }));
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [habits, permission, triggered]);

  return (
    <div className="tab-content">
      <h2 className="tab-title">⏰ Reminders</h2>

      {permission !== "granted" && (
        <div className="permission-card">
          <p>🔔 Allow notifications to receive habit reminders.</p>
          <button className="allow-btn" onClick={requestPermission}>
            Allow Notifications
          </button>
        </div>
      )}

      {permission === "granted" && (
        <div className="info-card success">
          <p>✅ Notifications are enabled!</p>
        </div>
      )}

      {habits.length === 0 && (
        <p className="empty">No habits found. Add habits from the Home tab first.</p>
      )}

      <div className="reminder-list">
        {habits.map((h) => (
          <div key={h.id} className="reminder-card">
            <div className="reminder-info">
              <span className="reminder-habit">{h.name}</span>
              <span className="reminder-category">{h.category}</span>
            </div>
            <div className="reminder-right">
              {h.reminder && (
                <span className="reminder-time">🔔 {h.reminder}</span>
              )}
              <input
                type="time"
                value={h.reminder || ""}
                onChange={(e) => setReminder(h.id, e.target.value)}
                className="time-input"
              />
              {h.reminder && (
                <button
                  className="clear-btn"
                  onClick={() => setReminder(h.id, null)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}