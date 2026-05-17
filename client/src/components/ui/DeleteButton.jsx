import Button from './Button';

export default function DeleteButton({ voyageId, onDelete, variant = 'danger', size = 'md', className = '', disabled = false }) {
  const handleClick = () => {
    if (onDelete) {
      onDelete(voyageId);
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
      🗑️ Supprimer
    </Button>
  );
}
