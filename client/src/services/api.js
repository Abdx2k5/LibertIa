import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Injecte le token JWT dans chaque requête ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("libertia_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Gère les erreurs 401 (token expiré) ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("libertia_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;