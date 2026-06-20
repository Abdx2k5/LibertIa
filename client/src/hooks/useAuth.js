import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { ROUTES } from "../utils/constants";

export function useAuth() {
  const { logout, user, role, isAuthenticated, loading } = useAuthStore();
  const navigate = useNavigate();

  // ── Déconnexion ───────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return {
    user,
    role,
    isAuthenticated,
    loading,
    handleLogout,
  };
}
