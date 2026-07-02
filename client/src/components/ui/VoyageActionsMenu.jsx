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

const svgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconShare2 = (p) => <svg {...svgProps} {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IconGlobe  = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const IconLock   = (p) => <svg {...svgProps} {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconTrash  = (p) => <svg {...svgProps} {...p}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconCheck  = (p) => <svg {...svgProps} {...p}><polyline points="20 6 9 17 4 12"/></svg>;

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
            <span className={styles.itemIcon}><IconShare2 /></span> Partager
          </button>

          {showVisibility ? (
            <button type="button" role="menuitem" className={styles.item} onClick={handleVisibility}>
              <span className={styles.itemIcon}>{isPublic ? <IconGlobe /> : <IconLock />}</span>
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
            <span className={styles.itemIcon}><IconTrash /></span> Supprimer
          </button>
        </div>
      ) : null}

      {duplicated ? <span className={styles.toast}><IconCheck width={14} height={14} /> Voyage dupliqué</span> : null}

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
