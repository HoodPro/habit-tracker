import { useState, useEffect } from "react";

const QUOTES = [
  "Small steps every day lead to big changes.",
  "Discipline is choosing between what you want now and what you want most.",
  "You don't have to be extreme, just consistent.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The secret of your future is hidden in your daily routine.",
  "Motivation gets you started. Habit keeps you going.",
  "Every day is a chance to be better than yesterday.",
  "Push yourself because no one else is going to do it for you.",
];

const CATEGORIES = ["General", "Health", "Fitness", "Study", "Mindfulness", "Finance"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Home({ habits, addHabit, toggleHabit, deleteHabit, getToday }) {
  const [time, setTime] = useState(new Date());
  const [newHabit, setNewHabit] = useState("");
  const [category, setCategory] = useState("General");
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = getToday();
  const completed = habits.filter((h) => h.completedDates.includes(today)).length;

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function formatDate(date) {
    return date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  return (
    <div className="tab-content">
      {/* Clock */}
      <div className="clock-card">
        <div className="clock-time">{formatTime(time)}</div>
        <div className="clock-date">{formatDate(time)}</div>
        <div className="greeting">{getGreeting()} 👋</div>
      </div>

      {/* Quote */}
      <div className="quote-card">
        <span className="quote-icon">💬</span>
        <p>{quote}</p>
      </div>

      {/* Progress summary */}
      <div className="summary-card">
        <p>{completed}/{habits.length} habits done today</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: habits.length ? `${(completed / habits.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Add habit */}
      <div className="add-habit">
        <input
          type="text"
          placeholder="Add a new habit..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit(newHabit, category) && setNewHabit("")}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => { addHabit(newHabit, category); setNewHabit(""); }}>Add</button>
      </div>

      {/* Habit list */}
      <div className="habit-list">
        {habits.length === 0 && <p className="empty">No habits yet. Add one above!</p>}
        {habits.map((h) => {
          const done = h.completedDates.includes(today);
          return (
            <div key={h.id} className={`habit-card ${done ? "done" : ""}`}>
              <div className="habit-left" onClick={() => toggleHabit(h.id)}>
                <span className="check">{done ? "✅" : "⬜"}</span>
                <div>
                  <span className="habit-name">{h.name}</span>
                  <span className="habit-category">{h.category}</span>
                </div>
              </div>
              <div className="habit-right">
                <span className="streak">🔥 {h.streak}d</span>
                <button className="delete" onClick={() => deleteHabit(h.id)}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}