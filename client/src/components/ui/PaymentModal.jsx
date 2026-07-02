// =============================================================
// FICHIER  : src/components/ui/PaymentModal.jsx
// TÂCHE    : T102 — Modal de paiement
//
// Encapsule PaymentForm dans la modal générique (Modal.jsx).
// Affiche un état de succès (icône verte, numéro de transaction,
// montant) une fois le paiement confirmé.
//
// PROPS :
//   - isOpen    → boolean — contrôle l'affichage
//   - amount    → number — montant à payer (affiché en €)
//   - onSuccess → function({ transactionId, amount }) — appelé
//                 quand l'utilisateur clique « Voir ma réservation »
//   - onCancel  → function() — fermeture / annulation
// =============================================================

import { useState } from "react";
import Modal from "./Modal";
import PaymentForm from "./PaymentForm";
import styles from "./PaymentModal.module.css";

function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

export default function PaymentModal({ isOpen, amount, onSuccess, onCancel }) {
  const [result, setResult] = useState(null);

  const handlePaymentSuccess = (data) => {
    setResult(data);
  };

  const handleClose = () => {
    setResult(null);
    onCancel?.();
  };

  const handleViewBooking = () => {
    const data = result;
    setResult(null);
    onSuccess?.(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={result ? "Paiement confirmé" : "Paiement"}
      size="sm"
    >
      {result ? (
        <div className={styles.success}>
          <CheckIcon />
          <h3 className={styles.successTitle}>Paiement confirmé !</h3>

          <div className={styles.successDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Numéro de transaction</span>
              <span className={styles.detailValue}>{result.transactionId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Montant</span>
              <span className={styles.detailValue}>{result.amount}€</span>
            </div>
          </div>

          <button type="button" className={styles.viewButton} onClick={handleViewBooking}>
            Voir ma réservation
          </button>
        </div>
      ) : (
        <PaymentForm amount={amount} onSuccess={handlePaymentSuccess} onCancel={handleClose} />
      )}
    </Modal>
  );
}
