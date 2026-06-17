// =============================================================
// FICHIER  : src/components/ui/AgencyCard.jsx
// TÂCHE    : T90 — Card d'agence (M6)
//
// Carte d'agence pour l'annuaire : couverture/logo, nom (+ pastille
// vérifiée), localisation, note/avis, spécialités, actions Voir /
// Contacter. Gère les formes mock (note/avis) et backend (statut).
//
// PROPS :
//   - agence    → { id|_id, nom, logo, couverture, localisation,
//                   note, avis, verifiee, specialites[] }
//   - onContact → function(agence)  (optionnel)
// =============================================================

import { Link } from "react-router-dom";
import styles from "./AgencyCard.module.css";
import { agencyDetailPath } from "../../utils/constants";

export default function AgencyCard({ agence, onContact }) {
  if (!agence) return null;

  const id = agence.id || agence._id;
  const { nom, logo, couverture, localisation, note, avis, verifiee, specialites = [] } = agence;

  const cover = couverture
    ? { backgroundImage: `url(${couverture})` }
    : { background: "linear-gradient(135deg, #aa3bff 0%, #00d9ff 120%)" };

  return (
    <article className={styles.card}>
      <div className={styles.cover} style={cover}>
        <div className={styles.logo}>
          {logo ? <img src={logo} alt={nom} /> : <span>{nom?.charAt(0) || "?"}</span>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h3 className={styles.nom}>
            {nom}
            {verifiee && <span className={styles.verified} title="Agence vérifiée">✓</span>}
          </h3>
          {typeof note === "number" && (
            <span className={styles.note}>★ {note.toFixed(1)}</span>
          )}
        </div>

        {localisation && <p className={styles.localisation}>📍 {localisation}</p>}
        {typeof avis === "number" && <p className={styles.avis}>{avis} avis</p>}

        {specialites.length > 0 && (
          <div className={styles.tags}>
            {specialites.slice(0, 4).map((s) => (
              <span key={s} className={styles.tag}>{s}</span>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Link to={agencyDetailPath(id)} className={styles.btnVoir}>
            Voir
          </Link>
          <button type="button" className={styles.btnContact} onClick={() => onContact?.(agence)}>
            Contacter
          </button>
        </div>
      </div>
    </article>
  );
}
