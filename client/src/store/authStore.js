import { createContext, useContext, useState, createElement } from "react";
import { TEST_TOKEN, getTestUser } from "../mocks/testAuthData";

const AuthContext = createContext(null);

// Active un faux utilisateur connecté pour tester les pages protégées
// sans passer par le login. Bascule via VITE_TEST_AUTH=true dans .env,
// rôle choisi via VITE_TEST_AUTH_ROLE ("user" ou "admin").
const TEST_AUTH_ENABLED = import.meta.env.VITE_TEST_AUTH === "true";
const TEST_AUTH_ROLE = import.meta.env.VITE_TEST_AUTH_ROLE || "user";

function getStoredToken() {
  if (TEST_AUTH_ENABLED) return TEST_TOKEN;
  return localStorage.getItem("libertia_token") || null;
}

function getStoredUser() {
  if (TEST_AUTH_ENABLED) return getTestUser(TEST_AUTH_ROLE);
  try {
    const raw = localStorage.getItem("libertia_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("libertia_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser]   = useState(() => getStoredUser());

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;

  const login = (userData, userToken) => {
    localStorage.setItem("libertia_token", userToken);
    localStorage.setItem("libertia_user", JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("libertia_token");
    localStorage.removeItem("libertia_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem("libertia_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return createElement(
    AuthContext.Provider,
    { value: { user, token, role, isAuthenticated, loading: false, login, logout, updateUser } },
    children
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthStore doit être utilisé dans <AuthProvider>");
  return context;
}

export default AuthContext;