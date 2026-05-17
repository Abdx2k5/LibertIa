import Button from './Button';

export default function ShareButton({ voyageId, onShare, variant = 'outline', size = 'md', className = '', disabled = false }) {
  const handleClick = () => {
    if (onShare) {
      onShare(voyageId);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      📤 Partager
    </Button>
  );
}
