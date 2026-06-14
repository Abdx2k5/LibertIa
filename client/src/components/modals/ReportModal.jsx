// =============================================================
// FICHIER  : src/components/modals/ReportModal.jsx
// TÂCHE    : T69 — Signalement
//
// Modal de signalement : choix d'un motif + détails optionnels.
// S'appuie sur le design system Modal/Button.
//
// PROPS :
//   - isOpen     → boolean
//   - onClose    → function
//   - onSubmit   → function({ reason, details })
//   - targetType → "publication" | "commentaire" | "profil" | ...
//   - loading    → boolean
// =============================================================

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import styles from "./ReportModal.module.css";

const REASONS = [
  { id: "spam", label: "Spam ou publicité", icon: "🚫" },
  { id: "harcelement", label: "Harcèlement ou haine", icon: "⚠️" },
  { id: "faux", label: "Fausse information", icon: "❌" },
  { id: "inapproprie", label: "Contenu inapproprié", icon: "🔞" },
  { id: "arnaque", label: "Arnaque ou fraude", icon: "🎣" },
  { id: "autre", label: "Autre", icon: "✏️" },
];

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  targetType = "publication",
  loading = false,
}) {
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  // réinitialise le formulaire à la fermeture (prêt pour la prochaine ouverture)
  const handleClose = () => {
    onClose?.();
    setReason(null);
    setDetails("");
    setSent(false);
  };

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit?.({ reason, details: details.trim() });
    setSent(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={sent ? "Signalement envoyé" : `Signaler cette ${targetType}`}
      size="md"
      footer={
        sent ? (
          <Button variant="primary" fullWidth onClick={handleClose}>
            Fermer
          </Button>
        ) : (
          <div className={styles.footer}>
            <Button variant="outline" fullWidth onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleSubmit}
              disabled={!reason || loading}
              loading={loading}
            >
              Envoyer le signalement
            </Button>
          </div>
        )
      }
    >
      {sent ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <p className={styles.successText}>
            Merci. Notre équipe va examiner ce contenu dans les plus brefs délais.
          </p>
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.intro}>
            Aidez-nous à garder Libertia sûr. Pourquoi signalez-vous cette {targetType} ?
          </p>

          <div className={styles.reasons} role="radiogroup" aria-label="Motif du signalement">
            {REASONS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={reason === item.id}
                className={`${styles.reason} ${reason === item.id ? styles.reasonActive : ""}`}
                onClick={() => setReason(item.id)}
              >
                <span className={styles.reasonIcon}>{item.icon}</span>
                <span className={styles.reasonLabel}>{item.label}</span>
                <span className={styles.radio} aria-hidden="true" />
              </button>
            ))}
          </div>

          <label className={styles.detailsLabel}>
            Détails (optionnel)
            <textarea
              className={styles.textarea}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Donnez plus de contexte à notre équipe de modération..."
              rows={3}
              maxLength={500}
            />
            <span className={styles.counter}>{details.length}/500</span>
          </label>
        </div>
      )}
    </Modal>
  );
}
