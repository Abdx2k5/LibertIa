import styles from "./HotelCard.module.css";

export default function HotelCard({ hotel, onSelect, isSelected }) {
  const getBadgeClass = (status) => {
    if (status === "warning") return styles.badgeWarning;
    if (status === "exceeded") return styles.badgeExceeded;
    return styles.badgeOk;
  };

  const getBadgeText = (status) => {
    if (status === "warning") return "⚠ Budget serré";
    if (status === "exceeded") return "✗ Dépassé";
    return "✓ OK";
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < count ? "#fbbf24" : "#4b5563" }}>
        ★
      </span>
    ));
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect?.(hotel)}
    >
      {isSelected && <div className={styles.checkmark}>✓</div>}

      {/* Image Placeholder */}
      <div className={styles.imagePlaceholder}>
        <div className={`${styles.badge} ${getBadgeClass(hotel.budgetStatus)}`}>
          {getBadgeText(hotel.budgetStatus)}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.nom}>{hotel.nom}</h3>

        {/* Stars & Rating */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>{renderStars(hotel.etoiles)}</div>
          <span className={styles.note}>{hotel.note}</span>
          <span className={styles.avis}>({hotel.avis} avis)</span>
        </div>

        {/* Location */}
        <div className={styles.location}>
          <span className={styles.pin}>📍</span>
          <span className={styles.quartier}>{hotel.quartier}</span>
        </div>

        {/* Price Section */}
        <div className={styles.priceSection}>
          <div>
            <div className={styles.prixNuitLabel}>Prix par nuit</div>
            <div className={styles.prixNuit}>{hotel.prixNuit}€</div>
          </div>
          <div>
            <div className={styles.prixTotalLabel}>{hotel.nuits} nuits</div>
            <div className={styles.prixTotal}>{hotel.prixTotal}€</div>
          </div>
        </div>

        {/* Services */}
        <div className={styles.services}>
          {hotel.services.map((service, idx) => (
            <span key={idx} className={styles.servicePill}>
              {service}
            </span>
          ))}
        </div>

        {/* Button */}
        <button
          className={styles.reserverBtn}
          onClick={(e) => e.stopPropagation()}
        >
          Réserver
        </button>
      </div>
    </div>
  );
}
