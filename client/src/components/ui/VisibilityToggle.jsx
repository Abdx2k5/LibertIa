// =============================================================
// FICHIER  : src/components/ui/VisibilityToggle.jsx
// TÂCHE    : T49 — Privé / Public
//
// Sélecteur de visibilité d'un voyage. Deux variantes :
//   - "switch" (défaut) → interrupteur compact avec libellé
//   - "segmented"       → deux pastilles côte à côte (Privé | Public)
//
// PROPS :
//   - isPublic   → boolean — état initial
//   - onChange   → function(nextIsPublic)
//   - variant    → "switch" | "segmented"
//   - disabled   → boolean
// =============================================================

import { useState } from "react";
import styles from "./VisibilityToggle.module.css";

export default function VisibilityToggle({
  isPublic: isPublicProp = false,
  onChange,
  variant = "switch",
  disabled = false,
}) {
  const [isPublic, setIsPublic] = useState(isPublicProp);

  const set = (next) => {
    if (disabled || next === isPublic) return;
    setIsPublic(next);
    onChange?.(next);
  };

  if (variant === "segmented") {
    return (
      <div className={`${styles.segmented} ${disabled ? styles.disabled : ""}`} role="group" aria-label="Visibilité">
        <button
          type="button"
          className={`${styles.segment} ${!isPublic ? styles.segmentActive : ""}`}
          onClick={() => set(false)}
          aria-pressed={!isPublic}
        >
          🔒 Privé
        </button>
        <button
          type="button"
          className={`${styles.segment} ${isPublic ? styles.segmentActive : ""}`}
          onClick={() => set(true)}
          aria-pressed={isPublic}
        >
          🌍 Public
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.row} ${isPublic ? styles.rowPublic : ""} ${disabled ? styles.disabled : ""}`}
      onClick={() => set(!isPublic)}
      aria-pressed={isPublic}
      disabled={disabled}
    >
      <span className={styles.info}>
        <span className={styles.icon}>{isPublic ? "🌍" : "🔒"}</span>
        <span className={styles.labels}>
          <span className={styles.label}>{isPublic ? "Public" : "Privé"}</span>
          <span className={styles.hint}>
            {isPublic ? "Visible par toute la communauté" : "Visible par vous uniquement"}
          </span>
        </span>
      </span>

      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
