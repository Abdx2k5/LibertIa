// =============================================================
// FICHIER  : src/services/boite.service.js
// TÂCHE    : T82 — API boîtes collaboratives
// =============================================================

import api from "./api";

const boiteService = {
  // POST /api/boites
  creerBoite: async (payload) => {
    const response = await api.post("/api/boites", payload);
    return response.data;
  },

  // GET /api/boites
  getMesBoites: async () => {
    const response = await api.get("/api/boites");
    return response.data;
  },

  // GET /api/boites/:id
  getBoite: async (id) => {
    const response = await api.get(`/api/boites/${id}`);
    return response.data;
  },

  // POST /api/boites/:id/inviter
  inviterMembre: async (id, email) => {
    const response = await api.post(`/api/boites/${id}/inviter`, { email });
    return response.data;
  },

  // DELETE /api/boites/:id/membres/:userId
  retirerMembre: async (id, userId) => {
    const response = await api.delete(`/api/boites/${id}/membres/${userId}`);
    return response.data;
  },

  // DELETE /api/boites/:id
  supprimerBoite: async (id) => {
    const response = await api.delete(`/api/boites/${id}`);
    return response.data;
  },

  // GET /api/boites/:id/messages?page=&limit=
  getMessages: async (id, params = {}) => {
    const response = await api.get(`/api/boites/${id}/messages`, { params });
    return response.data;
  },
};

export default boiteService;
