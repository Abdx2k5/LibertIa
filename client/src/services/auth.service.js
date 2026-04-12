// Toutes les routes auth du backend :
//   POST /api/auth/register
//   POST /api/auth/login
//   GET  /api/auth/me       (protégé)
//   POST /api/auth/logout   (protégé)
//   PUT  /api/auth/profile  (protégé)
//
// FORMAT DES RÉPONSES BACKEND :
//   login/register → réponse PLATE : { _id, nom, email, abonnement, profilePhoto, promptsRestants, token }
//   updateProfile  → { success: true, data: { _id, nom, email, ... } }
// =============================================================

import api from "./api";

const authService = {

  // ── POST /api/auth/register ───────────────────────────────
  // Envoie : { nom (concaténé), email, motDePasse, preferences }
  // Reçoit : { _id, nom, email, abonnement, profilePhoto, promptsRestants, token }
  register: async ({ nom, email, motDePasse, preferences }) => {
    const res = await api.post("/auth/register", {
      nom,
      email,
      motDePasse,
      preferences: preferences || [],
    });
    return res.data;
  },

  // ── POST /api/auth/login ──────────────────────────────────
  // Envoie : { email, motDePasse }
  // Reçoit : { _id, nom, email, abonnement, profilePhoto, promptsRestants, token }
  login: async ({ email, motDePasse }) => {
    const res = await api.post("/auth/login", { email, motDePasse });
    return res.data;
  },

  // ── GET /api/auth/me ──────────────────────────────────────
  // Token injecté automatiquement par api.js
  // Reçoit : l'objet user complet (sans motDePasse)
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  // ── PUT /api/auth/profile ─────────────────────────────────
  // Envoie : { nom, age, bio, preferences }
  // Reçoit : { success: true, data: { _id, nom, email, age, bio, profilePhoto, preferences, promptsRestants } }
  // → On retourne directement data.data (le sous-objet user)
  updateProfile: async ({ nom, age, bio, preferences }) => {
    const res = await api.put("/auth/profile", {
      nom,
      age,
      bio,
      preferences,
    });
    return res.data.data; // ← .data.data car backend encapsule dans { success, data: {...} }
  },

  // ── POST /api/auth/logout ─────────────────────────────────
  // Le backend retourne juste { success: true, message: "Déconnexion réussie" }
  // La vraie déconnexion = supprimer le token localStorage (géré par authStore.logout)
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },
};

export default authService;