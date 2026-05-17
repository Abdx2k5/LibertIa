import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

export default function LogoutButton({ variant = 'outline', size = 'md', className = '', onClick: onClickProp }) {
  const { handleLogout } = useAuth();

  const handleClick = () => {
    if (onClickProp) onClickProp();
    handleLogout();
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      Déconnexion
    </Button>
  );
}
