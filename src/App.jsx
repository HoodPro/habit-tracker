import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import Home from "./components/Home";
import Stats from "./components/Stats";
import Steps from "./components/Steps";
import Reminders from "./components/Reminders";
import Journal from "./components/Journal";
import "./App.css";

const TABS = [
  { id: "home", label: "Home", icon: "🏠", bg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=60" },
  { id: "stats", label: "Stats", icon: "📊", bg: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&q=60" },
  { id: "steps", label: "Steps", icon: "👣", bg: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=60" },
  { id: "reminders", label: "Alarms", icon: "⏰", bg: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=60" },
  { id: "journal", label: "Journal", icon: "📓", bg: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=60" },
];

function App() {
  const [tab, setTab] = useState("home");
  const [prevTab, setPrevTab] = useState(null);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const tabIds = TABS.map(t => t.id);

  useEffect(() => {
    console.log("Checking redirect result...");
    getRedirectResult(auth).then(async (result) => {
      console.log("Redirect result:", result);
      if (result?.user) {
        console.log("User from redirect:", result.user);
        setUser(result.user);
        await loadHabits(result.user.uid);
        setLoading(false);
      }
    }).catch((e) => console.error("Redirect error:", e));

    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed:", u);
      setUser(u);
      if (u) {
        await loadHabits(u.uid);
      } else {
        const saved = localStorage.getItem("habits");
        setHabits(saved ? JSON.parse(saved) : []);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loadHabits(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setHabits(snap.data().habits || []);
  }

  async function saveHabits(updated, uid) {
    if (uid) await setDoc(doc(db, "users", uid), { habits: updated }, { merge: true });
    else localStorage.setItem("habits", JSON.stringify(updated));
  }

  function getToday() {
    return new Date().toISOString().split("T")[0];
  }

  function switchTab(newTab) {
    if (newTab === tab || sliding) return;
    const oldIdx = tabIds.indexOf(tab);
    const newIdx = tabIds.indexOf(newTab);
    setDirection(newIdx > oldIdx ? 1 : -1);
    setPrevTab(tab);
    setSliding(true);
    setTimeout(() => {
      setTab(newTab);
      setSliding(false);
      setPrevTab(null);
    }, 380);
  }

  function addHabit(name, category) {
    if (!name.trim()) return;
    const updated = [...habits, {
      id: Date.now(), name: name.trim(),
      category: category || "General",
      completedDates: [], streak: 0, reminder: null,
    }];
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
      return { ...h, completedDates, streak: calcStreak(completedDates) };
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
    let streak = 0, current = new Date();
    for (let d of sorted) {
      const diff = Math.round((current - new Date(d)) / 86400000);
      if (diff <= 1) { streak++; current = new Date(d); }
      else break;
    }
    return streak;
  }

  async function handleLogin() {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (e) {
      console.error("Login error:", e);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setHabits([]);
  }

  const currentTabData = TABS.find(t => t.id === tab);
  const prevTabData = TABS.find(t => t.id === prevTab);

  if (loading) return (
    <div className="app loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="app">
      {/* Backgrounds */}
      {TABS.map(t => (
        <div
          key={t.id}
          className={`bg-layer ${t.id === tab ? "bg-active" : ""} ${t.id === prevTab ? "bg-prev" : ""}`}
          style={{ backgroundImage: `url(${t.bg})` }}
        />
      ))}
      <div className="bg-overlay" />

      {/* Header */}
      <header className="app-header">
        <span className="app-title">HabitFlow</span>
        {user ? (
          <div className="user-info">
            <img src={user.photoURL} alt="avatar" className="avatar" />
            <button className="logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        ) : (
          <button className="login-btn" onClick={handleLogin}>Sign in</button>
        )}
      </header>

      {/* Content */}
      <main className={`content slide-${sliding ? (direction > 0 ? "left" : "right") : "idle"}`}>
        {tab === "home" && <Home habits={habits} addHabit={addHabit} toggleHabit={toggleHabit} deleteHabit={deleteHabit} getToday={getToday} />}
        {tab === "stats" && <Stats habits={habits} getToday={getToday} />}
        {tab === "steps" && <Steps />}
        {tab === "reminders" && <Reminders habits={habits} setReminder={setReminder} />}
        {tab === "journal" && <Journal user={user} db={db} />}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => switchTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;