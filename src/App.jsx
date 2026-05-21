import { useState, useEffect } from "react";
import Home from "./components/Home";
import Stats from "./components/Stats";
import Steps from "./components/Steps";
import Reminders from "./components/Reminders";
import Journal from "./components/Journal";
import "./App.css";

function App() {
  const [tab, setTab] = useState("home");
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("habits");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  function getToday() {
    return new Date().toISOString().split("T")[0];
  }

  function addHabit(name, category) {
    if (!name.trim()) return;
    setHabits([
      ...habits,
      {
        id: Date.now(),
        name: name.trim(),
        category: category || "General",
        completedDates: [],
        streak: 0,
        reminder: null,
      },
    ]);
  }

  function toggleHabit(id) {
    const today = getToday();
    setHabits(habits.map((h) => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(today);
      const completedDates = done
        ? h.completedDates.filter((d) => d !== today)
        : [...h.completedDates, today];
      const streak = calcStreak(completedDates);
      return { ...h, completedDates, streak };
    }));
  }

  function deleteHabit(id) {
    setHabits(habits.filter((h) => h.id !== id));
  }

  function setReminder(id, time) {
    setHabits(habits.map((h) => h.id === id ? { ...h, reminder: time } : h));
  }

  function calcStreak(dates) {
    if (!dates.length) return 0;
    const sorted = [...dates].sort().reverse();
    let streak = 0;
    let current = new Date();
    for (let d of sorted) {
      const diff = Math.round((current - new Date(d)) / 86400000);
      if (diff <= 1) { streak++; current = new Date(d); }
      else break;
    }
    return streak;
  }

  return (
    <div className="app">
      <main className="content">
        {tab === "home" && (
          <Home habits={habits} addHabit={addHabit} toggleHabit={toggleHabit} deleteHabit={deleteHabit} getToday={getToday} />
        )}
        {tab === "stats" && <Stats habits={habits} getToday={getToday} />}
        {tab === "steps" && <Steps />}
        {tab === "reminders" && <Reminders habits={habits} setReminder={setReminder} />}
        {tab === "journal" && <Journal />}
      </main>

      <nav className="bottom-nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>🏠<span>Home</span></button>
        <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}>📊<span>Stats</span></button>
        <button className={tab === "steps" ? "active" : ""} onClick={() => setTab("steps")}>👣<span>Steps</span></button>
        <button className={tab === "reminders" ? "active" : ""} onClick={() => setTab("reminders")}>⏰<span>Alarms</span></button>
        <button className={tab === "journal" ? "active" : ""} onClick={() => setTab("journal")}>📓<span>Journal</span></button>
      </nav>
    </div>
  );
}

export default App;