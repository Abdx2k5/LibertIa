// =============================================================
// FICHIER  : src/components/ui/Button.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// VARIANTES disponibles via la prop `variant` :
//   - "primary"  → gradient cyan → violet (bouton principal)
//   - "outline"  → bordure blanche semi-transparente (secondaire)
//   - "ghost"    → fond transparent, texte coloré (tertiaire)
//   - "danger"   → rouge (suppression, action destructive)
//   - "cyan"     → fond cyan plein (boutons IA dashboard)
//
// TAILLES disponibles via la prop `size` :
//   - "sm"  → petit  (padding 8px 16px,  font 13px)
//   - "md"  → moyen  (padding 11px 21px, font 14px) ← défaut
//   - "lg"  → grand  (padding 13px 24px, font 15px)
//
// USAGE :
//   <Button>Se connecter</Button>
//   <Button variant="outline" size="sm">Annuler</Button>
//   <Button variant="primary" loading>Génération...</Button>
//   <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
// =============================================================

const VARIANT_STYLES = {
  primary: {
    background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
    border: "none",
    color: "#061826",
    fontWeight: 700,
  },
  outline: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#ffffff",
    fontWeight: 400,
  },
  ghost: {
    background: "transparent",
    border: "none",
    color: "#00ffff",
    fontWeight: 500,
  },
  danger: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    fontWeight: 500,
  },
  cyan: {
    background: "linear-gradient(90deg, #00ffff, #8b5cf6)",
    border: "none",
    color: "#000000",
    fontWeight: 700,
  },
};

const SIZE_STYLES = {
  sm: { padding: "8px 16px",  fontSize: 13, borderRadius: 6 },
  md: { padding: "11px 21px", fontSize: 14, borderRadius: 6 },
  lg: { padding: "13px 24px", fontSize: 15, borderRadius: 8 },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  style = {},
  fullWidth = false,
}) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    transition: "opacity 0.2s",
    fontFamily: "'Inter', sans-serif",
    textAlign: "center",
    whiteSpace: "nowrap",
    width: fullWidth ? "100%" : "auto",
    ...VARIANT_STYLES[variant] || VARIANT_STYLES.primary,
    ...SIZE_STYLES[size] || SIZE_STYLES.md,
    ...style,
  };

  return (
    <button
      type={type}
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Chargement..." : children}
    </button>
  );
}