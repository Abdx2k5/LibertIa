import { createContext, useContext, useState, createElement } from "react";

const AuthContext = createContext(null);

function getStoredToken() {
  return localStorage.getItem("libertia_token") || null;
}

function getStoredUser() {
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