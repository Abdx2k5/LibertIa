// =============================================================
// FICHIER  : src/components/ui/FollowButton.jsx
// TÂCHE    : T65 — Follow
//
// Bouton suivre/abonné. Au survol de l'état "Abonné", affiche
// "Ne plus suivre" en rouge (pattern type réseau social).
//
// PROPS :
//   - following   → boolean — état initial (défaut: false)
//   - onToggle    → function(nextFollowing)
//   - size        → "sm" | "md" (défaut: "md")
//   - fullWidth   → boolean
// =============================================================

import { useState } from "react";
import styles from "./FollowButton.module.css";

const IconCheck = (p) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FollowButton({
  following: followingProp = false,
  onToggle,
  size = "md",
  fullWidth = false,
}) {
  const [following, setFollowing] = useState(followingProp);

  const handleClick = () => {
    const next = !following;
    setFollowing(next);
    onToggle?.(next);
  };

  const className = [
    styles.button,
    styles[size],
    following ? styles.following : styles.idle,
    fullWidth ? styles.fullWidth : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-pressed={following}
    >
      {following ? (
        <>
          <span className={styles.labelDefault}>
            <span className={styles.check}><IconCheck /></span> Abonné
          </span>
          <span className={styles.labelHover}>Ne plus suivre</span>
        </>
      ) : (
        <span>
          <span className={styles.plus}>+</span> Suivre
        </span>
      )}
    </button>
  );
}
