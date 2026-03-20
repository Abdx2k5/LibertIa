// =============================================================
// FICHIER  : src/components/ui/Card.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// VARIANTES :
//   - "glass"       → glassmorphism standard (partout)
//   - "glass-cyan"  → glassmorphism + bordure cyan (Dashboard IA)
//   - "solid"       → fond plein + ombre (Login/Register)
//   - "destination" → overflow hidden pour images (Landing)
//
// USAGE :
//   <Card>Contenu quelconque</Card>
//   <Card variant="glass-cyan" padding={40}>Formulaire</Card>
//   <Card variant="destination" onClick={() => navigate('/voyage/1')}>
//     <img src={imgParis} />
//   </Card>
// =============================================================

const VARIANT_STYLES = {
  glass: {
    backdropFilter: "blur(6px)",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  "glass-cyan": {
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(0,255,255,0.2)",
    boxShadow: "0px 8px 32px 0px rgba(0,255,255,0.1)",
  },
  solid: {
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.5)",
  },
  destination: {
    backdropFilter: "blur(6px)",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
};

export default function Card({
  children,
  variant = "glass",
  padding = 25,
  rounded = 8,
  onClick,
  style = {},
}) {
  const isClickable = !!onClick;

  return (
    <div
      style={{
        borderRadius: rounded,
        padding: variant === "destination" ? 0 : padding,
        position: "relative",
        cursor: isClickable ? "pointer" : "default",
        transition: isClickable ? "opacity 0.2s, transform 0.15s" : "none",
        ...VARIANT_STYLES[variant] || VARIANT_STYLES.glass,
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={isClickable ? (e) => {
        e.currentTarget.style.opacity = "0.85";
        e.currentTarget.style.transform = "translateY(-2px)";
      } : undefined}
      onMouseLeave={isClickable ? (e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
      } : undefined}
    >
      {children}
    </div>
  );
}