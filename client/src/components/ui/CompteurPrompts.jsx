// =============================================================
// FICHIER  : src/components/ui/CompteurPrompts.jsx
// TÂCHE    : T31 — Compteur de prompts X/10 (M2)
//
// Affiche le nombre de prompts utilisés sur le quota gratuit,
// avec barre de progression, alerte près de la limite et CTA
// "Passer Premium".
//
// PROPS :
//   - used      → number — prompts consommés
//   - max       → number — quota (défaut: FREEMIUM.MAX_FREE_PROMPTS)
//   - onUpgrade → function — clic sur le CTA Premium (optionnel)
// =============================================================

import { FREEMIUM } from "../../utils/constants";
import Button from "./Button";

export default function CompteurPrompts({ used = 0, max = FREEMIUM.MAX_FREE_PROMPTS, onUpgrade }) {
  const safeMax = Math.max(1, max);
  const safeUsed = Math.max(0, Math.min(used, safeMax));
  const remaining = safeMax - safeUsed;
  const percent = Math.round((safeUsed / safeMax) * 100);

  const reached = safeUsed >= safeMax;
  const nearLimit = !reached && remaining <= 2;

  const barColor = reached
    ? "#ef4444"
    : nearLimit
    ? "#f59e0b"
    : "linear-gradient(90deg, #06b6d4, #8b5cf6)";

  const s = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    label: { fontSize: 14, fontWeight: 500, color: "#e7f0ff" },
    count: { fontSize: 14, fontWeight: 700, color: reached ? "#f87171" : "#06b6d4" },
    barTrack: {
      width: "100%",
      height: 8,
      background: "rgba(255,255,255,0.06)",
      borderRadius: 999,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      width: `${percent}%`,
      background: barColor,
      borderRadius: 999,
      transition: "width 0.3s ease",
    },
    message: {
      fontSize: 12,
      color: reached ? "#f87171" : nearLimit ? "#fbbf24" : "#94a3b8",
    },
  };

  const message = reached
    ? "Quota gratuit atteint. Passez Premium pour continuer."
    : nearLimit
    ? `Plus que ${remaining} prompt${remaining > 1 ? "s" : ""} gratuit${remaining > 1 ? "s" : ""}.`
    : `${remaining} prompt${remaining > 1 ? "s" : ""} gratuit${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""}.`;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.label}>Prompts IA</span>
        <span style={s.count}>
          {safeUsed}/{safeMax}
        </span>
      </div>

      <div style={s.barTrack}>
        <div style={s.barFill} />
      </div>

      <span style={s.message}>{message}</span>

      {(reached || nearLimit) && onUpgrade && (
        <Button variant="primary" size="sm" onClick={onUpgrade} fullWidth>
          Passer Premium
        </Button>
      )}
    </div>
  );
}
