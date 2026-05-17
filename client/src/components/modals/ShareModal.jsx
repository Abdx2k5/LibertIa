import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './ShareModal.module.css';

export default function ShareModal({ isOpen, onClose, voyageTitle, voyageId }) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/voyage/${voyageId}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleShareEmail = () => {
    const subject = `Découvrez mon voyage: ${voyageTitle}`;
    const body = `Jete partage ce voyage créé avec LibertIa: ${getShareUrl()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareTwitter = () => {
    const text = `Découvrez mon voyage "${voyageTitle}" créé avec #LibertIa`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Partager: ${voyageTitle}`}
      size="md"
    >
      <div className={styles.content}>
        <div className={styles.linkSection}>
          <label className={styles.label}>Lien du voyage</label>
          <div className={styles.linkContainer}>
            <input
              type="text"
              readOnly
              value={getShareUrl()}
              className={styles.linkInput}
            />
            <Button
              variant={copied ? 'outline' : 'cyan'}
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? '✓ Copié' : 'Copier'}
            </Button>
          </div>
        </div>

        <div className={styles.divider}>ou partager via</div>

        <div className={styles.socialButtons}>
          <Button
            variant="outline"
            size="md"
            onClick={handleShareEmail}
            className={styles.socialBtn}
          >
            ✉️ Email
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleShareTwitter}
            className={styles.socialBtn}
          >
            𝕏 Twitter
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleShareFacebook}
            className={styles.socialBtn}
          >
            f Facebook
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <Button variant="outline" fullWidth onClick={onClose}>
          Fermer
        </Button>
      </div>
    </Modal>
  );
}
