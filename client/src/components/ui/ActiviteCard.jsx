import { useState } from "react";
import styles from "./ActiviteCard.module.css";

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
            <span className={styles.note}>⭐ {activite.note}</span>
            <span className={styles.duree}>⏱ {activite.duree}</span>
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
            {isAdded ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}
