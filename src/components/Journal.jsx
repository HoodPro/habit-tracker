import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";

const MOODS = ["😄", "😊", "😐", "😔", "😢", "😤", "😴", "🤩", "😰", "🥳"];

export default function Journal({ user, db }) {
  const [entries, setEntries] = useState({});
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user && db) {
      loadEntries();
    } else {
      const saved = localStorage.getItem("journal");
      const parsed = saved ? JSON.parse(saved) : {};
      setEntries(parsed);
      if (parsed[today]) {
        setNote(parsed[today].note || "");
        setMood(parsed[today].mood || "");
      }
    }
  }, [user]);

  async function loadEntries() {
    try {
      const ref = doc(db, "journals", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data().entries || {};
        setEntries(data);
        if (data[today]) {
          setNote(data[today].note || "");
          setMood(data[today].mood || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveEntry() {
    if (!note.trim() && !mood) return;
    const updated = {
      ...entries,
      [today]: { note, mood, date: today },
    };
    setEntries(updated);

    if (user && db) {
      await setDoc(
        doc(db, "journals", user.uid),
        { entries: updated },
        { merge: true }
      );
    } else {
      localStorage.setItem("journal", JSON.stringify(updated));
    }
    alert("Journal entry saved! ✅");
  }

  async function deleteEntry(date) {
    const updated = { ...entries };
    delete updated[date];
    setEntries(updated);

    if (user && db) {
      await setDoc(
        doc(db, "journals", user.uid),
        { entries: updated },
        { merge: true }
      );
    } else {
      localStorage.setItem("journal", JSON.stringify(updated));
    }
  }

  const sortedEntries = Object.values(entries).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="tab-content">
      <h2 className="tab-title">📓 Journal</h2>

      {!user && (
        <div className="info-card">
          <p>💡 Sign in with Google to sync your journal across devices!</p>
        </div>
      )}

      <div className="journal-card">
        <h3>How are you feeling today?</h3>
        <div className="mood-picker">
          {MOODS.map((m) => (
            <button
              key={m}
              className={`mood-btn ${mood === m ? "selected" : ""}`}
              onClick={() => setMood(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <textarea
          className="journal-input"
          placeholder="Write your thoughts for today..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
        />

        <button className="save-btn" onClick={saveEntry}>
          Save Entry 💾
        </button>
      </div>

      <div className="past-entries">
        <h3>Past Entries</h3>
        {sortedEntries.length === 0 && (
          <p className="empty">No journal entries yet.</p>
        )}
        {sortedEntries.map((entry) => (
          <div key={entry.date} className="entry-card">
            <div className="entry-header">
              <span className="entry-date">{formatDate(entry.date)}</span>
              <div className="entry-actions">
                {entry.mood && (
                  <span className="entry-mood">{entry.mood}</span>
                )}
                <button className="delete" onClick={() => deleteEntry(entry.date)}>
                  🗑
                </button>
              </div>
            </div>
            {entry.note && <p className="entry-note">{entry.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}