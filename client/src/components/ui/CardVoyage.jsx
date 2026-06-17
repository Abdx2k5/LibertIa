// =============================================================
// FICHIER  : src/components/ui/CardVoyage.jsx
// TÂCHE    : T40 — Card voyage (image, destination, dates) (M3)
//
// Carte voyage : image de destination, destination, dates, budget,
// badges (continent, type) et menu d'actions (VoyageActionsMenu).
//
// PROPS :
//   - voyage       → { id, destination|titre, image|cover, dateDebut,
//                      dateFin, date, budget, continent, type, isPublic }
//   - onOpen       → function(voyage)
//   - onDelete     → function(id)            (optionnel, transmis au menu)
//   - onDuplicate  → function(id)            (optionnel)
//   - onVisibility → function(id, isPublic)  (optionnel)
//   - showActions  → boolean — affiche le menu ⋮ (défaut: true)
// =============================================================

import styles from "./CardVoyage.module.css";
import VoyageActionsMenu from "./VoyageActionsMenu";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatBudget(value) {
  if (value == null || value === "") return "";
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("fr-FR")} €`;
}

function formatPeriode(voyage) {
  const debut = formatDate(voyage.dateDebut);
  const fin = formatDate(voyage.dateFin);
  if (debut && fin) return `${debut} → ${fin}`;
  return debut || fin || formatDate(voyage.date);
}

export default function CardVoyage({
  voyage,
  onOpen,
  onDelete,
  onDuplicate,
  onVisibility,
  showActions = true,
}) {
  if (!voyage) return null;

  const destination = voyage.destination || voyage.titre || "Destination";
  const image = voyage.image || voyage.cover;
  const periode = formatPeriode(voyage);
  const budget = formatBudget(voyage.budget);

  const cover = image
    ? { backgroundImage: `url(${image})` }
    : { background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)" };

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.cover}
        style={cover}
        onClick={() => onOpen?.(voyage)}
        aria-label={`Ouvrir le voyage ${destination}`}
      >
        {!image && <span className={styles.coverInitial}>{destination.charAt(0)}</span>}
        {budget && <span className={styles.budget}>{budget}</span>}
      </button>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h3 className={styles.destination}>{destination}</h3>
          {showActions && (
            <VoyageActionsMenu
              voyage={{ id: voyage.id, titre: destination, isPublic: voyage.isPublic }}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onVisibility={onVisibility}
            />
          )}
        </div>

        {periode && <p className={styles.dates}>📅 {periode}</p>}

        <div className={styles.metaRow}>
          {voyage.continent && <span className={styles.metaTag}>{voyage.continent}</span>}
          {voyage.type && <span className={styles.metaTag}>{voyage.type}</span>}
        </div>
      </div>
    </article>
  );
}
