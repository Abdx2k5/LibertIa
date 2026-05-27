import styles from "./VolCard.module.css";

export default function VolCard({ vol, onSelect, isSelected }) {
  const initials = vol.compagnie
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect?.(vol)}
    >
      {isSelected && <div className={styles.checkmark}>✓</div>}

      <div className={styles.content}>
        {/* Left: Logo */}
        <div className={styles.left}>
          <div className={styles.logoCircle}>{initials}</div>
        </div>

        {/* Middle: Flight Route */}
        <div className={styles.middle}>
          <div className={styles.routeRow}>
            <div className={styles.location}>
              <div className={styles.ville}>{vol.depart.ville}</div>
              <div className={styles.heure}>{vol.depart.heure}</div>
            </div>

            <div className={styles.dotted}>
              <svg viewBox="0 0 100 2" preserveAspectRatio="none">
                <line x1="0" y1="1" x2="100" y2="1" strokeDasharray="4,2" />
              </svg>
              <div className={styles.duree}>{vol.duree}</div>
            </div>

            <div className={styles.location}>
              <div className={styles.ville}>{vol.arrivee.ville}</div>
              <div className={styles.heure}>{vol.arrivee.heure}</div>
            </div>
          </div>
        </div>

        {/* Right: Price & Button */}
        <div className={styles.right}>
          <div className={styles.prix}>{vol.prix}€</div>
          <button className={styles.reserverBtn} onClick={(e) => e.stopPropagation()}>
            Réserver
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottom}>
        <div className={styles.escales}>
          {vol.escales === 0 ? (
            <span className={styles.pillGreen}>Direct</span>
          ) : (
            <span className={styles.pill}>{vol.escales} escale{vol.escales > 1 ? "s" : ""}</span>
          )}
        </div>
        <div className={styles.classe}>{vol.classe}</div>
        <div className={styles.numero}>{vol.numero}</div>
      </div>
    </div>
  );
}
