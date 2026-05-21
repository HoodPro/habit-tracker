import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import Home from "./components/Home";
import Stats from "./components/Stats";
import Steps from "./components/Steps";
import Reminders from "./components/Reminders";
import Journal from "./components/Journal";
import "./App.css";

function App() {
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);

  // Auth listener
  useEffect(() => {
    getRedirectResult(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadHabits(u.uid);
      } else {
        const saved = localStorage.getItem("habits");
        setHabits(saved ? JSON.parse(saved) : []);
      }
      setLoading(false);
    });
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
        loadHabits(result.user.uid);
      }
    }).catch(console.error);
    return unsub;
  }, []);

  async function loadHabits(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setHabits(snap.data().habits || []);
    }
  }

  async function saveHabits(updated, uid) {
    if (uid) {
      await setDoc(doc(db, "users", uid), { habits: updated }, { merge: true });
    } else {
      localStorage.setItem("habits", JSON.stringify(updated));
    }
  }

  function getToday() {
    return new Date().toISOString().split("T")[0];
  }

  function addHabit(name, category) {
    if (!name.trim()) return;
    const updated = [
      ...habits,
      {
        id: Date.now(),
        name: name.trim(),
        category: category || "General",
        completedDates: [],
        streak: 0,
        reminder: null,
      },
    ];
    setHabits(updated);
    saveHabits(updated, user?.uid);
  }

  function toggleHabit(id) {
    const today = getToday();
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(today);
      const completedDates = done
        ? h.completedDates.filter((d) => d !== today)
        : [...h.completedDates, today];
      const streak = calcStreak(completedDates);
      return { ...h, completedDates, streak };
    });
    setHabits(updated);
    saveHabits(updated, user?.uid);
  }

  function deleteHabit(id) {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    saveHabits(updated, user?.uid);
  }

  function setReminder(id, time) {
    const updated = habits.map((h) => h.id === id ? { ...h, reminder: time } : h);
    setHabits(updated);
    saveHabits(updated, user?.uid);
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

  async function handleLogin() {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setHabits([]);
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <span className="app-title">🔥 HabitFlow</span>
        {user ? (
          <div className="user-info">
            <img src={user.photoURL} alt="avatar" className="avatar" />
            <button className="logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        ) : (
          <button className="login-btn" onClick={handleLogin}>
            Sign in with Google
          </button>
        )}
      </header>

      <main className="content">
        {tab === "home" && (
          <Home habits={habits} addHabit={addHabit} toggleHabit={toggleHabit} deleteHabit={deleteHabit} getToday={getToday} />
        )}
        {tab === "stats" && <Stats habits={habits} getToday={getToday} />}
        {tab === "steps" && <Steps />}
        {tab === "reminders" && <Reminders habits={habits} setReminder={setReminder} />}
        {tab === "journal" && <Journal user={user} db={db} />}
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