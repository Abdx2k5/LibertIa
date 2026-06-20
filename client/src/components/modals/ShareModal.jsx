import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './ShareModal.module.css';

const svgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { marginRight: 4, verticalAlign: -3 } };
const IconCheck = (p) => <svg {...svgProps} strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconMail  = (p) => <svg {...svgProps} {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;

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
              {copied ? <><IconCheck />Copié</> : 'Copier'}
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
<IconMail />Email
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
