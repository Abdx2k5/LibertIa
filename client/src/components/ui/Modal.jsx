// =============================================================
// FICHIER  : src/components/ui/Modal.jsx
// TÂCHE    : T129 — Bibliothèque composants UI (design system)
//
// USAGE :
//   <Modal isOpen={show} onClose={() => setShow(false)} title="Titre">
//     Contenu
//   </Modal>
//
// PROPS :
//   - isOpen    → boolean — contrôle l'affichage
//   - onClose   → function — clic fond ou bouton ✕
//   - title     → string — titre en haut
//   - size      → "sm" | "md" | "lg"
//   - footer    → JSX — boutons d'action en bas
//   - showClose → boolean — affiche le bouton ✕ (défaut: true)
// =============================================================

import { useEffect } from "react";

const IconX = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SIZE_WIDTHS = { sm: 380, md: 480, lg: 600 };

const s = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 20,
  },
  box: {
    backgroundColor: "#0b1220",
    border: "1px solid var(--border)",
    borderRadius: 16,
    boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.7)",
    position: "relative",
    maxHeight: "90vh", overflowY: "auto",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 28px 0",
  },
  title:    { fontSize: 20, fontWeight: 700, color: "#e7f0ff", margin: 0 },
  closeBtn: {
    background: "none", border: "none",
    color: "#94a3b8", fontSize: 20,
    cursor: "pointer", padding: "4px 8px",
    borderRadius: 6, lineHeight: 1,
    display: "inline-flex", alignItems: "center",
  },
  body:   { padding: "16px 28px", flex: 1, color: "#94a3b8", fontSize: 15, lineHeight: 1.6 },
  footer: { padding: "0 28px 24px", display: "flex", flexDirection: "column", gap: 10 },
  divider: { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "0 0 16px" },
};

export default function Modal({
  isOpen, onClose, title,
  size = "md", children, footer,
  showClose = true,
}) {
  // Bloque le scroll du body quand la modal est ouverte
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Ferme sur la touche Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && isOpen) onClose?.(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{ ...s.box, width: SIZE_WIDTHS[size] || SIZE_WIDTHS.md }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div style={s.header}>
            {title && <h2 style={s.title}>{title}</h2>}
            {showClose && (
              <button style={s.closeBtn} onClick={onClose} aria-label="Fermer"><IconX /></button>
            )}
          </div>
        )}
        <div style={s.body}>{children}</div>
        {footer && (
          <div style={s.footer}>
            <hr style={s.divider} />
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}