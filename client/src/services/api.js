import axios from "axios";

// =============================================================
// T137 — Wrapper Axios robuste et réutilisable
//
// Toutes les requêtes de l'app passent par cette instance :
//  - baseURL configurable via VITE_API_URL (port 5000 par défaut)
//  - timeout de 15s
//  - injection automatique du token JWT (Authorization: Bearer ...)
//  - normalisation des erreurs (401 / 403 / 5xx / réseau)
// =============================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Injecte le token JWT dans chaque requête ──────────────────────
// (même clé de stockage que authStore.getStoredToken() : "libertia_token")
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

// ── Normalise les erreurs et gère les cas globaux ─────────────────
//  - 401 : session expirée/invalide -> on nettoie le stockage (même
//          effet que authStore.logout()) et on redirige vers /login
//          (window.location.href car hors contexte React Router)
//  - 403 : accès refusé
//  - 5xx : erreur serveur
//  - pas de réponse (réseau coupé / CORS / timeout) : message de connexion
//
// Dans tous les cas, l'erreur rejetée est un objet `Error` standard :
//  - `.message`       : message normalisé, prêt à afficher à l'utilisateur
//  - `.originalError` : l'erreur axios brute (pour debug)
//  - `.response` / `.request` / `.config` / `.code` sont recopiés depuis
//    l'erreur axios afin que le code existant qui lit
//    `err.response?.data?.message` continue de fonctionner sans
//    modification (les réponses de succès, elles, ne sont pas touchées).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message;

    if (!error.response) {
      // Pas de réponse du serveur : réseau coupé, CORS, timeout...
      message = "Impossible de contacter le serveur. Vérifiez votre connexion.";
    } else {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem("libertia_token");
        localStorage.removeItem("libertia_user");
        message = data?.message || "Session expirée, veuillez vous reconnecter.";

        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (status === 403) {
        message = "Accès refusé";
      } else if (status >= 500) {
        message = "Erreur serveur, veuillez réessayer plus tard";
      } else {
        message = data?.message || error.message;
      }
    }

    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    normalizedError.response = error.response;
    normalizedError.request = error.request;
    normalizedError.config = error.config;
    normalizedError.code = error.code;

    return Promise.reject(normalizedError);
  }
);

// =============================================================
// Helpers — patterns courants (T137)
// Additionnels : le code existant utilisant api.get/post/patch/delete
// directement continue de fonctionner sans aucun changement.
// =============================================================
export const apiGet = (url, params) => api.get(url, { params }).then((r) => r.data);
export const apiPost = (url, body) => api.post(url, body).then((r) => r.data);
export const apiPatch = (url, body) => api.patch(url, body).then((r) => r.data);
export const apiDelete = (url) => api.delete(url).then((r) => r.data);

// ── Upload avec suivi de progression (0-100) ──────────────────────
export const apiUpload = (url, formData, onProgress) =>
  api
    .post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
    .then((r) => r.data);

export default api;
