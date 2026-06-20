import { useState } from "react";
import styles from "./HotelCard.module.css";
import Modal from "./Modal";
import AvisSection from "./AvisSection";

const svgProps = { width: 14, height: 14, viewBox: "0 0 24 24", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconAlertTriangle = (p) => <svg {...svgProps} fill="none" stroke="currentColor" {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconX             = (p) => <svg {...svgProps} fill="none" stroke="currentColor" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCheck         = (p) => <svg {...svgProps} fill="none" stroke="currentColor" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconStar          = (p) => <svg {...svgProps} fill="currentColor" stroke="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconMapPin        = (p) => <svg {...svgProps} fill="none" stroke="currentColor" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

export default function HotelCard({ hotel, onSelect, isSelected }) {
  const [avisModalOpen, setAvisModalOpen] = useState(false);

  const getBadgeClass = (status) => {
    if (status === "warning") return styles.badgeWarning;
    if (status === "exceeded") return styles.badgeExceeded;
    return styles.badgeOk;
  };

  const getBadgeText = (status) => {
    if (status === "warning") return <><IconAlertTriangle /> Budget serré</>;
    if (status === "exceeded") return <><IconX /> Dépassé</>;
    return <><IconCheck /> OK</>;
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <IconStar key={i} style={{ color: i < count ? "var(--warning)" : "#4b5563" }} />
    ));
  };

  return (
    <>
      <div
        className={`${styles.card} ${isSelected ? styles.selected : ""}`}
        onClick={() => onSelect?.(hotel)}
      >
        {isSelected && <div className={styles.checkmark}><IconCheck width={16} height={16} /></div>}

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

          <button
            type="button"
            className={styles.avisLink}
            onClick={(e) => {
              e.stopPropagation();
              setAvisModalOpen(true);
            }}
          >
            {hotel.avis} avis
          </button>

          {/* Location */}
          <div className={styles.location}>
            <span className={styles.pin}><IconMapPin /></span>
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

      <Modal
        isOpen={avisModalOpen}
        onClose={() => setAvisModalOpen(false)}
        title={`Avis — ${hotel.nom}`}
        size="md"
      >
        <AvisSection cibleNom={hotel.nom} cibleType="hotel" />
      </Modal>
    </>
  );
}
