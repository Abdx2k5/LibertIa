import styles from "./ActiviteCard.module.css";

const svgProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconStar  = (p) => <svg {...svgProps} fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconClock = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck = (p) => <svg {...svgProps} strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12"/></svg>;

export default function ActiviteCard({ activite, onAdd, isAdded }) {
  return (
    <div className={styles.card}>
      {/* Left: Image */}
      <div className={styles.imagePlaceholder} />

      {/* Right: Content */}
      <div className={styles.content}>
        <div className={styles.body}>
          <h3 className={styles.titre}>{activite.titre}</h3>

          <div className={styles.meta}>
            <span className={styles.note}><IconStar /> {activite.note}</span>
            <span className={styles.duree}><IconClock /> {activite.duree}</span>
          </div>

          <div className={styles.categoriePill}>{activite.categorie}</div>
        </div>

        {/* Right: Price & Button */}
        <div className={styles.right}>
          <div className={styles.prix}>{activite.prix}€</div>
          <button
            className={`${styles.addBtn} ${isAdded ? styles.added : ""}`}
            onClick={() => onAdd?.(activite)}
            title={isAdded ? "Ajouté" : "Ajouter"}
          >
            {isAdded ? <IconCheck /> : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}
