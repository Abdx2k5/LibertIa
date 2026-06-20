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

const svgProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconBan           = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
const IconAlertTriangle = (p) => <svg {...svgProps} {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconXCircle       = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconShieldAlert   = (p) => <svg {...svgProps} {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>;
const IconPencil        = (p) => <svg {...svgProps} {...p}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.986L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497Z"/><path d="m15 5 4 4"/></svg>;
const IconCheck         = (p) => <svg {...svgProps} strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12"/></svg>;

const REASONS = [
  { id: "spam", label: "Spam ou publicité", icon: IconBan },
  { id: "harcelement", label: "Harcèlement ou haine", icon: IconAlertTriangle },
  { id: "faux", label: "Fausse information", icon: IconXCircle },
  { id: "inapproprie", label: "Contenu inapproprié", icon: IconShieldAlert },
  { id: "arnaque", label: "Arnaque ou fraude", icon: IconAlertTriangle },
  { id: "autre", label: "Autre", icon: IconPencil },
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
          <div className={styles.successIcon}><IconCheck width={32} height={32} /></div>
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
                <span className={styles.reasonIcon}><item.icon /></span>
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
