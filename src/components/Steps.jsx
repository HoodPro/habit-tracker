import { useState, useEffect, useRef } from "react";

const GOAL = 10000;

export default function Steps() {
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem("steps");
    const today = new Date().toISOString().split("T")[0];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.steps;
    }
    return 0;
  });

  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(true);
  const lastAcc = useRef(null);
  const threshold = 12;

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("steps", JSON.stringify({ date: today, steps }));
  }, [steps]);

  useEffect(() => {
    if (!window.DeviceMotionEvent) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      if (lastAcc.current !== null) {
        const delta = Math.abs(magnitude - lastAcc.current);
        if (delta > threshold) {
          setSteps((s) => s + 1);
        }
      }
      lastAcc.current = magnitude;
    }

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [active]);

  async function toggleTracking() {
    if (!active && typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") return;
      } catch {
        return;
      }
    }
    setActive((a) => !a);
  }

  const percent = Math.min((steps / GOAL) * 100, 100);
  const remaining = Math.max(GOAL - steps, 0);

  return (
    <div className="tab-content">
      <h2 className="tab-title">👣 Step Counter</h2>

      {!supported ? (
        <div className="info-card">
          <p>⚠️ Your device doesn't support motion detection.</p>
          <p>Step counting works on mobile devices with an accelerometer.</p>
        </div>
      ) : (
        <>
          <div className="steps-card">
            <div className="steps-count">{steps.toLocaleString()}</div>
            <div className="steps-label">steps today</div>
            <div className="steps-goal">Goal: {GOAL.toLocaleString()}</div>
          </div>

          <div className="steps-progress">
            <div className="progress-bar large">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <p className="progress-label">{Math.round(percent)}% of daily goal</p>
          </div>

          <div className="steps-stats">
            <div className="stat-item">
              <span className="stat-value">{remaining.toLocaleString()}</span>
              <span className="stat-label">Steps remaining</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round(steps * 0.0008 * 10) / 10} km</span>
              <span className="stat-label">Distance</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round(steps * 0.04)}</span>
              <span className="stat-label">Calories</span>
            </div>
          </div>

          <button
            className={`track-btn ${active ? "active" : ""}`}
            onClick={toggleTracking}
          >
            {active ? "⏹ Stop Tracking" : "▶ Start Tracking"}
          </button>

          {active && (
            <p className="tracking-note">📱 Keep your phone in your pocket while walking.</p>
          )}

          <button
            className="reset-btn"
            onClick={() => { setSteps(0); setActive(false); }}
          >
            Reset Steps
          </button>
        </>
      )}
    </div>
  );
}