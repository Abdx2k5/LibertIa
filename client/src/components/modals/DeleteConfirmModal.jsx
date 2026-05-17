import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './DeleteConfirmModal.module.css';

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
        <div className={styles.warning}>⚠️</div>
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
