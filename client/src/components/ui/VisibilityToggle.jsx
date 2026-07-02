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

const svgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconGlobe = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const IconLock  = (p) => <svg {...svgProps} {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

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
          <IconLock /> Privé
        </button>
        <button
          type="button"
          className={`${styles.segment} ${isPublic ? styles.segmentActive : ""}`}
          onClick={() => set(true)}
          aria-pressed={isPublic}
        >
          <IconGlobe /> Public
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
        <span className={styles.icon}>{isPublic ? <IconGlobe /> : <IconLock />}</span>
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
