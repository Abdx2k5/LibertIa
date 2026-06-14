import Button from './Button';

// Icône téléchargement (flèche vers le bas + socle)
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// T106 — Exporte la page courante en PDF via l'impression du navigateur
// (la mise en page imprimable est gérée par les règles @media print
// du composant qui utilise ce bouton).
export default function ExportPdfButton({ onExport, variant = 'outline', size = 'md', className = '', disabled = false }) {
  const handleClick = () => {
    if (onExport) {
      onExport();
    } else if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick} disabled={disabled}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <DownloadIcon />
        Exporter en PDF
      </span>
    </Button>
  );
}
