// =============================================================
// FICHIER  : src/components/ui/DossierCard.jsx
// TÂCHE    : T73 — Composant dossier (carte) souvenir (M5)
//
// Carte affichant un dossier souvenir : bandeau couleur/couverture,
// titre, description, compteur de souvenirs, date, badge voyage.
//
// PROPS :
//   - dossier  → objet { id, titre, description, couleur, couverture,
//                nbSouvenirs|souvenirs, date|createdAt, voyage }
//   - onOpen   → function(dossier)
//   - onEdit   → function(dossier)   (optionnel)
//   - onDelete → function(id)        (optionnel)
// =============================================================

import styles from "./DossierCard.module.css";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DossierCard({ dossier, onOpen, onEdit, onDelete }) {
  if (!dossier) return null;

  const {
    id,
    titre,
    description,
    couleur = "#7c3aed",
    couverture,
    voyage,
  } = dossier;

  const nbSouvenirs =
    dossier.nbSouvenirs ??
    (Array.isArray(dossier.souvenirs) ? dossier.souvenirs.length : 0);
  const date = formatDate(dossier.date || dossier.createdAt);

  const cover = couverture
    ? { backgroundImage: `url(${couverture})` }
    : { background: `linear-gradient(135deg, ${couleur} 0%, #16171d 130%)` };

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.cover}
        style={cover}
        onClick={() => onOpen?.(dossier)}
        aria-label={`Ouvrir le dossier ${titre}`}
      >
        {!couverture && <span className={styles.coverInitial}>{titre?.charAt(0) || "?"}</span>}
        <span className={styles.count}>{nbSouvenirs} souvenir{nbSouvenirs > 1 ? "s" : ""}</span>
      </button>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{titre}</h3>
          {voyage && <span className={styles.voyageBadge}>📍 {voyage.destination || voyage}</span>}
        </div>

        {description && <p className={styles.description}>{description}</p>}

        <div className={styles.footer}>
          {date && <span className={styles.date}>{date}</span>}
          <div className={styles.actions}>
            {onEdit && (
              <button type="button" className={styles.iconBtn} onClick={() => onEdit(dossier)} aria-label="Modifier">
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.delete}`}
                onClick={() => onDelete(id)}
                aria-label="Supprimer"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
