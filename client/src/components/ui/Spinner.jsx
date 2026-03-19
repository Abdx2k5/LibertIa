// =============================================================
// FICHIER  : src/components/ui/Spinner.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// USAGE :
//   <Spinner />
//   <Spinner size={16} color="#8b5cf6" />
//   <Spinner label="Génération IA en cours..." />
// =============================================================

const spinStyle = `@keyframes libertia-spin { to { transform: rotate(360deg); } }`;

if (typeof document !== "undefined" && !document.getElementById("libertia-spinner-styles")) {
  const s = document.createElement("style");
  s.id = "libertia-spinner-styles";
  s.textContent = spinStyle;
  document.head.appendChild(s);
}

export default function Spinner({ size = 24, color = "#00ffff", label, style = {} }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: label ? 10 : 0, ...style }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.1)",
        borderTopColor: color,
        animation: "libertia-spin 0.7s linear infinite",
        flexShrink: 0,
      }} />
      {label && <span style={{ fontSize: 14, color: "#a1a1aa", fontFamily: "'Inter', sans-serif" }}>{label}</span>}
    </div>
  );
}