import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './DeleteConfirmModal.module.css';

const IconAlertTriangle = (p) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, voyageTitle, loading = false }) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmer la suppression"
      size="sm"
    >
      <div className={styles.content}>
        <div className={styles.warning}><IconAlertTriangle /></div>
        <p className={styles.message}>
          Êtes-vous sûr de vouloir supprimer le voyage <strong>"{voyageTitle}"</strong> ?
        </p>
        <p className={styles.warning_text}>
          Cette action est irréversible.
        </p>
      </div>

      <div className={styles.footer}>
        <Button
          variant="outline"
          fullWidth
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={handleConfirm}
          disabled={loading}
          loading={loading}
        >
          Supprimer définitivement
        </Button>
      </div>
    </Modal>
  );
}
