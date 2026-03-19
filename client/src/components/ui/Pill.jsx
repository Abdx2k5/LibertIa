// =============================================================
// FICHIER  : src/components/ui/Pill.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// USAGE :
//   <Pill>Plutôt vol ✈️</Pill>
//   <Pill active onClick={() => toggle('vol')}>Plutôt vol ✈️</Pill>
// =============================================================

export default function Pill({ children, active = false, onClick, style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "9px 17px", borderRadius: 12,
        fontSize: 14, fontFamily: "'Inter', sans-serif",
        cursor: "pointer", transition: "all 0.15s",
        backgroundColor: active ? "rgba(139,92,246,0.2)" : "#0f1724",
        border: active ? "1px solid #6ee7f3" : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#e7f0ff" : "#94a3b8",
        ...style,
      }}
    >
      {children}
    </button>
  );
}