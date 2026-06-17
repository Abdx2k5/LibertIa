// =============================================================
// FICHIER  : src/components/ui/MeteoJour.jsx
// TÂCHE    : T111 — Composant météo sur itinéraire (M8)
//
// Badge météo pour un jour d'itinéraire : icône, température et
// libellé. Si la prop `meteo` n'est pas fournie, une météo
// déterministe est dérivée de la date (mock, pas d'appel externe).
//
// PROPS :
//   - meteo → { condition, tempMin, tempMax } (optionnel)
//   - date  → string|Date — utilisé pour le fallback déterministe
//   - compact → boolean — version réduite (icône + temp uniquement)
// =============================================================

import styles from "./MeteoJour.module.css";

const CONDITIONS = {
  ensoleille: { icone: "☀️", label: "Ensoleillé" },
  nuageux: { icone: "⛅", label: "Nuageux" },
  couvert: { icone: "☁️", label: "Couvert" },
  pluie: { icone: "🌧️", label: "Pluie" },
  orage: { icone: "⛈️", label: "Orage" },
};

const ORDER = ["ensoleille", "nuageux", "couvert", "pluie", "orage"];

// Hash simple et déterministe à partir d'une chaîne (date)
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) % 100000;
  }
  return h;
}

function fallbackMeteo(date) {
  const seed = hashString(String(date || "jour"));
  const condition = ORDER[seed % ORDER.length];
  const tempMin = 8 + (seed % 12); // 8–19°C
  const tempMax = tempMin + 4 + (seed % 6); // +4 à +9°C
  return { condition, tempMin, tempMax };
}

export default function MeteoJour({ meteo, date, compact = false }) {
  const data = meteo || fallbackMeteo(date);
  const cond = CONDITIONS[data.condition] || CONDITIONS.nuageux;

  const temp =
    data.tempMax != null && data.tempMin != null
      ? `${data.tempMin}° / ${data.tempMax}°`
      : data.tempMax != null
      ? `${data.tempMax}°`
      : "";

  return (
    <div className={`${styles.badge} ${compact ? styles.compact : ""}`} title={cond.label}>
      <span className={styles.icone} aria-hidden="true">{cond.icone}</span>
      {!compact && <span className={styles.label}>{cond.label}</span>}
      {temp && <span className={styles.temp}>{temp}</span>}
    </div>
  );
}
