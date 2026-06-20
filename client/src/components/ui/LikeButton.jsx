// =============================================================
// FICHIER  : src/components/ui/LikeButton.jsx
// TÂCHE    : T56 — Likes
//
// Bouton "j'aime" réutilisable avec animation cœur + compteur.
//
// PROPS :
//   - count       → number  — nombre de likes initial
//   - liked       → boolean — état initial (défaut: false)
//   - onToggle    → function(nextLiked, nextCount) — callback
//   - size        → "sm" | "md" (défaut: "md")
//   - showCount   → boolean — affiche le compteur (défaut: true)
// =============================================================

import { useEffect, useState } from "react";
import styles from "./LikeButton.module.css";

const IconHeart = ({ filled, ...p }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

function formatCount(value) {
  if (value == null) return "0";
  if (value < 1000) return String(value);

  const units = [
    { limit: 1_000_000, suffix: "M" },
    { limit: 1_000, suffix: "k" },
  ];

  const unit = units.find((entry) => value >= entry.limit) || units[1];
  const formatted = value / unit.limit;
  const rounded = formatted >= 10 ? formatted.toFixed(0) : formatted.toFixed(1);

  return `${rounded.replace(/\.0$/, "")}${unit.suffix}`;
}

export default function LikeButton({
  count = 0,
  liked: likedProp = false,
  onToggle,
  size = "md",
  showCount = true,
}) {
  const [liked, setLiked] = useState(likedProp);
  const [pulse, setPulse] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!pulse) return undefined;
    const timer = window.setTimeout(() => setPulse(false), 320);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  const displayCount = (count || 0) + (liked && !likedProp ? 1 : 0) - (!liked && likedProp ? 1 : 0);

  const handleClick = () => {
    const next = !liked;
    setLiked(next);
    setPulse(true);
    if (next) setBurst(true);
    onToggle?.(next, displayCount + (next ? 1 : -1));
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[size]} ${liked ? styles.liked : ""} ${pulse ? styles.pulse : ""}`}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Retirer le like" : "Aimer"}
    >
      <span className={styles.iconWrap}>
        <span className={styles.icon}><IconHeart filled={liked} /></span>
        {burst ? (
          <span className={styles.particles} onAnimationEnd={() => setBurst(false)}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={styles.particle} style={{ "--i": i }} />
            ))}
          </span>
        ) : null}
      </span>
      {showCount ? <span className={styles.count}>{formatCount(displayCount)}</span> : null}
    </button>
  );
}
