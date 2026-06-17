// =============================================================
// FICHIER  : src/components/ui/VoyageTimeline.jsx
// TÂCHE    : T87 — Timeline des voyages (M5)
//
// Timeline verticale des voyages triés par date de début. Chaque
// entrée : pastille de statut (à venir / en cours / passé), date,
// destination, période et budget. Clic → onSelect(voyage).
//
// PROPS :
//   - voyages  → array (utilise dates.start / dates.end, destination,
//                titre, budget)
//   - onSelect → function(voyage)  (optionnel)
// =============================================================

import { useMemo } from "react";
import styles from "./VoyageTimeline.module.css";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function getStatut(voyage, now) {
  const start = voyage.dates?.start ? new Date(voyage.dates.start) : null;
  const end = voyage.dates?.end ? new Date(voyage.dates.end) : start;
  if (!start || Number.isNaN(start.getTime())) return "inconnu";
  if (end && now > end) return "passe";
  if (now >= start && (!end || now <= end)) return "encours";
  return "avenir";
}

const STATUT_META = {
  avenir: { label: "À venir", cls: "dotAvenir" },
  encours: { label: "En cours", cls: "dotEncours" },
  passe: { label: "Passé", cls: "dotPasse" },
  inconnu: { label: "", cls: "dotPasse" },
};

export default function VoyageTimeline({ voyages = [], onSelect }) {
  const now = useMemo(() => new Date(), []);

  const sorted = useMemo(() => {
    return [...voyages].sort((a, b) => {
      const da = new Date(a.dates?.start || 0).getTime();
      const db = new Date(b.dates?.start || 0).getTime();
      return da - db;
    });
  }, [voyages]);

  if (sorted.length === 0) {
    return <div className={styles.empty}>Aucun voyage à afficher sur la timeline.</div>;
  }

  return (
    <ol className={styles.timeline}>
      {sorted.map((v) => {
        const id = v._id || v.id;
        const statut = getStatut(v, now);
        const meta = STATUT_META[statut];
        return (
          <li key={id} className={styles.item}>
            <div className={`${styles.dot} ${styles[meta.cls]}`} aria-hidden="true" />
            <button type="button" className={styles.content} onClick={() => onSelect?.(v)}>
              <div className={styles.topRow}>
                <span className={styles.destination}>{v.titre || v.destination}</span>
                {meta.label && <span className={`${styles.badge} ${styles[meta.cls]}`}>{meta.label}</span>}
              </div>
              <p className={styles.periode}>
                🗓️ {formatDate(v.dates?.start)}
                {v.dates?.end ? ` → ${formatDate(v.dates.end)}` : ""}
              </p>
              <div className={styles.metaRow}>
                {v.destination && <span className={styles.metaTag}>📍 {v.destination}</span>}
                {v.budget?.total != null && (
                  <span className={styles.metaTag}>💰 {v.budget.total} {v.budget.currency || "EUR"}</span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
