// =============================================================
// FICHIER  : src/components/ui/DuplicateButton.jsx
// TÂCHE    : T51 — Dupliquer un voyage
//
// Bouton de duplication avec feedback "Dupliqué ✓" temporaire.
//
// PROPS :
//   - voyageId    → string|number
//   - onDuplicate → function(voyageId) — peut renvoyer une Promise
//   - variant     → "outline" | "ghost" | "primary" (défaut: "outline")
//   - size        → "sm" | "md" (défaut: "md")
//   - fullWidth   → boolean
// =============================================================

import { useState } from "react";
import styles from "./DuplicateButton.module.css";

const IconCheck = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function DuplicateButton({
  voyageId,
  onDuplicate,
  variant = "outline",
  size = "md",
  fullWidth = false,
}) {
  const [state, setState] = useState("idle"); // idle | loading | done

  const handleClick = async () => {
    if (state !== "idle") return;
    try {
      setState("loading");
      await onDuplicate?.(voyageId);
      setState("done");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
    }
  };

  const className = [
    styles.button,
    styles[size],
    styles[variant] || styles.outline,
    fullWidth ? styles.fullWidth : "",
    state === "done" ? styles.done : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={className} onClick={handleClick} disabled={state === "loading"}>
      {state === "loading" ? (
        <>
          <span className={styles.spinner} aria-hidden="true" /> Duplication...
        </>
      ) : state === "done" ? (
        <><IconCheck /> Dupliqué</>
      ) : (
        <>⧉ Dupliquer</>
      )}
    </button>
  );
}
