import { useState, useEffect } from "react";

const MOODS = ["😄", "😊", "😐", "😔", "😢", "😤", "😴", "🤩", "😰", "🥳"];

export default function Journal() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("journal");
    return saved ? JSON.parse(saved) : {};
  });

  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (entries[today]) {
      setNote(entries[today].note || "");
      setMood(entries[today].mood || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("journal", JSON.stringify(entries));
  }, [entries]);

  function saveEntry() {
    if (!note.trim() && !mood) return;
    setEntries((prev) => ({
      ...prev,
      [today]: { note, mood, date: today },
    }));
    alert("Journal entry saved! ✅");
  }

  function deleteEntry(date) {
    setEntries((prev) => {
      const updated = { ...prev };
      delete updated[date];
      return updated;
    });
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

      {/* Today's entry */}
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

      {/* Past entries */}
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
                {entry.mood && <span className="entry-mood">{entry.mood}</span>}
                <button
                  className="delete"
                  onClick={() => deleteEntry(entry.date)}
                >
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