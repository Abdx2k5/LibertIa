import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import authService from "../services/Auth.service";
import { ROUTES } from "../utils/constants";

export function useAuth() {
  const { login, logout, user, role, isAuthenticated, loading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError]     = useState(null);
  const [pending, setPending] = useState(false);

  // ── Connexion ─────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    setError(null);
    setPending(true);
    try {
      const data = await authService.login(email, password);
      login(data.user, data.token);
      navigate(data.user.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setPending(false);
    }
  };

  // ── Inscription ───────────────────────────────────────────────
  const handleRegister = async (formData) => {
    setError(null);
    setPending(true);
    try {
      const data = await authService.register(formData);
      login(data.user, data.token);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  };

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
    error,
    pending,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: () => setError(null),
  };
}