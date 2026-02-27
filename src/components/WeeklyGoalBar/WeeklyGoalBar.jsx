import { useState, useEffect } from "react";
import { goalAPI } from "../../services/api";
import "./WeeklyGoalBar.css";

export default function WeeklyGoalBar({ applications }) {
  const [goal, setGoal] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState("5");

  // fetch goal on mount
  useEffect(() => {
    async function fetchGoal() {
      try {
        const g = await goalAPI.getGoal();
        setGoal(g);
        setInputVal(String(g));
      } catch (err) {
        console.error("Error fetching goal:", err);
      }
    }
    fetchGoal();
  }, []);

  // Count applications created this week (Monday–Sunday)
  const weeklyCount = applications.filter((app) => {
    if (!app.applied_at) return false;
    const appDate = new Date(app.applied_at);
    const now = new Date();

    // Get this Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    // Get this Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return appDate >= monday && appDate <= sunday;
  }).length;

  const percentage = Math.min((weeklyCount / goal) * 100, 100);
  const isGoalReached = weeklyCount >= goal;

  async function handleGoalSave() {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) return;
    try {
      const updated = await goalAPI.updateGoal(parsed);
      setGoal(updated);
    } catch (err) {
      console.error("Error saving goal:", err);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleGoalSave();
    if (e.key === "Escape") setIsEditing(false);
  }

  return (
    <div className={`weekly-goal-bar ${isGoalReached ? "goal-reached" : ""}`}>
      <div className="weekly-goal-top">
        <span className="weekly-goal-label">
          {isGoalReached ? "★ Weekly goal reached!" : "Weekly goal"}
        </span>

        <span className="weekly-goal-count">
          <strong>{weeklyCount}</strong>
          <span className="weekly-goal-separator"> / </span>
          {isEditing ? (
            <input
              className="weekly-goal-input"
              type="number"
              min="1"
              max="100"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={handleGoalSave}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span
              className="weekly-goal-target"
              onClick={() => setIsEditing(true)}
            >
              {goal}
              <span className="weekly-goal-edit-icon">✎</span>
            </span>
          )}
          <span className="weekly-goal-unit"> this week</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="weekly-goal-track">
        <div className="weekly-goal-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
