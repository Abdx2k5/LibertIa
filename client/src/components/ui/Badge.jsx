// =============================================================
// FICHIER  : src/components/ui/Badge.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// VARIANTES : "success" | "warning" | "default" | "premium" | "cyan" | "gold"
//
// USAGE :
//   <Badge>Budget 1500€</Badge>
//   <Badge variant="warning">Dépassement +50€</Badge>
//   <Badge variant="gold" icon={imgStar}>Vous avez aimé Tokyo</Badge>
// =============================================================

const VARIANT_STYLES = {
  success: { backgroundColor: "rgba(34,197,94,0.1)",   border: "1px solid rgba(34,197,94,0.2)",   color: "#4ade80"  },
  warning: { backgroundColor: "rgba(249,115,22,0.1)",  border: "1px solid rgba(249,115,22,0.2)",  color: "#f97316"  },
  default: { backgroundColor: "rgba(255,255,255,0.05)",border: "1px solid rgba(255,255,255,0.1)", color: "#d4d4d8"  },
  premium: { backgroundColor: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa"  },
  cyan:    { backgroundColor: "rgba(0,255,255,0.1)",   border: "1px solid rgba(0,255,255,0.3)",   color: "#00ffff"  },
  gold:    { backgroundColor: "rgba(255,215,0,0.1)",   border: "1px solid rgba(255,215,0,0.2)",   color: "#ffd700"  },
};

export default function Badge({ children, variant = "default", icon, style = {} }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      gap: icon ? 6 : 0, padding: "5px 11px",
      borderRadius: 12, fontSize: 12, fontWeight: 500,
      fontFamily: "'Inter', sans-serif",
      ...VARIANT_STYLES[variant] || VARIANT_STYLES.default,
      ...style,
    }}>
      {icon && <img src={icon} alt="" style={{ width: 12, height: 12 }} />}
      {children}
    </div>
  );
}