// =============================================================
// FICHIER  : src/components/ui/Input.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// PROPS disponibles :
//   - label          → texte au-dessus du champ
//   - placeholder    → texte gris dans le champ
//   - icon           → image à gauche (src URL)
//   - iconRight      → image à droite (ex: icône œil)
//   - onIconRightClick → callback clic icône droite
//   - error          → message d'erreur sous le champ
//   - variant        → "default" | "search" | "error"
//
// USAGE :
//   <Input label="Email" placeholder="votre@email.com" icon={imgEmail} />
//   <Input type="password" error="Champ requis" />
//   <Input variant="search" placeholder="Rechercher..." />
// =============================================================

const VARIANT_STYLES = {
  default: {
    backgroundColor: "#0f1724",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e7f0ff",
  },
  search: {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(0,255,255,0.2)",
    color: "#ffffff",
  },
  error: {
    backgroundColor: "#0f1724",
    border: "1px solid rgba(248,113,113,0.5)",
    color: "#e7f0ff",
  },
};

const s = {
  wrapper:   { display: "flex", flexDirection: "column", gap: 8, width: "100%" },
  label:     { fontSize: 14, fontWeight: 500, color: "#e7f0ff" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: {
    width: "100%", borderRadius: 6,
    padding: "13px 17px", fontSize: 15,
    outline: "none", fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s",
  },
  iconLeft:  { position: "absolute", left: 16, width: 18, height: 18, pointerEvents: "none" },
  iconRight: { position: "absolute", right: 16, width: 18, height: 18, cursor: "pointer", opacity: 0.6 },
  errorMsg:  { fontSize: 12, color: "#f87171", marginTop: 2 },
};

export default function Input({
  label, placeholder, type = "text",
  value, onChange,
  variant = "default", error,
  icon, iconRight, onIconRightClick,
  disabled = false, autoComplete, required = false,
  style = {},
}) {
  const activeVariant = error ? "error" : variant;
  const paddingLeft   = icon      ? "49px" : "17px";
  const paddingRight  = iconRight ? "48px" : "17px";

  return (
    <div style={{ ...s.wrapper, ...style }}>
      {label && <label style={s.label}>{label}</label>}
      <div style={s.inputWrap}>
        {icon && <img src={icon} alt="" style={s.iconLeft} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          style={{
            ...s.input,
            ...VARIANT_STYLES[activeVariant],
            paddingLeft, paddingRight,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {iconRight && (
          <img src={iconRight} alt="" style={s.iconRight} onClick={onIconRightClick} />
        )}
      </div>
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  );
}