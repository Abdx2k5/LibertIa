// =============================================================
// FICHIER  : src/components/ui/VoyageActionsMenu.jsx
// TÂCHES   : T45 Supprimer · T47 Partager · T49 Privé/Public · T51 Dupliquer
//
// Menu d'actions "⋮" pour une carte voyage. Regroupe partage,
// visibilité, duplication et suppression. Branche les modals
// ShareModal / DeleteConfirmModal existantes.
//
// PROPS :
//   - voyage          → { id, titre, isPublic }
//   - onDelete        → function(id)   — peut renvoyer une Promise
//   - onDuplicate     → function(id)   — peut renvoyer une Promise
//   - onVisibility    → function(id, isPublic)
//   - showVisibility  → boolean — affiche l'item Privé/Public (défaut: true)
// =============================================================

import { useEffect, useRef, useState } from "react";
import styles from "./VoyageActionsMenu.module.css";
import ShareModal from "../modals/ShareModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function VoyageActionsMenu({
  voyage = {},
  onDelete,
  onDuplicate,
  onVisibility,
  showVisibility = true,
}) {
  const { id, titre = "Voyage", isPublic: initialPublic = false } = voyage;

  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicated, setDuplicated] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => setIsPublic(initialPublic), [initialPublic]);

  // fermeture au clic extérieur + Escape
  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleVisibility = () => {
    const next = !isPublic;
    setIsPublic(next);
    onVisibility?.(id, next);
  };

  const handleDuplicate = async () => {
    setOpen(false);
    await onDuplicate?.(id);
    setDuplicated(true);
    window.setTimeout(() => setDuplicated(false), 1800);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await onDelete?.(id);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.wrap} ref={menuRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerActive : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions du voyage"
      >
        ⋮
      </button>

      {open ? (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              setShareOpen(true);
              setOpen(false);
            }}
          >
            <span className={styles.itemIcon}>📤</span> Partager
          </button>

          {showVisibility ? (
            <button type="button" role="menuitem" className={styles.item} onClick={handleVisibility}>
              <span className={styles.itemIcon}>{isPublic ? "🌍" : "🔒"}</span>
              <span className={styles.itemLabel}>
                {isPublic ? "Rendre privé" : "Rendre public"}
              </span>
              <span className={`${styles.pill} ${isPublic ? styles.pillPublic : ""}`}>
                {isPublic ? "Public" : "Privé"}
              </span>
            </button>
          ) : null}

          <button type="button" role="menuitem" className={styles.item} onClick={handleDuplicate}>
            <span className={styles.itemIcon}>⧉</span> Dupliquer
          </button>

          <div className={styles.divider} />

          <button
            type="button"
            role="menuitem"
            className={`${styles.item} ${styles.danger}`}
            onClick={() => {
              setDeleteOpen(true);
              setOpen(false);
            }}
          >
            <span className={styles.itemIcon}>🗑️</span> Supprimer
          </button>
        </div>
      ) : null}

      {duplicated ? <span className={styles.toast}>✓ Voyage dupliqué</span> : null}

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        voyageTitle={titre}
        voyageId={id}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        voyageTitle={titre}
        loading={deleting}
      />
    </div>
  );
}
