// =============================================================
// FICHIER  : src/services/avis.service.js
// TÂCHE    : T95 — Avis sur les agences / hôtels / vols
// =============================================================

import api from "./api";

const avisService = {
  // GET /api/avis?cibleNom=...&cibleType=...
  getAvis: async (cibleNom, cibleType) => {
    const response = await api.get("/api/avis", { params: { cibleNom, cibleType } });
    return response.data;
  },

  // POST /api/avis  { cibleType, cibleNom, note, commentaire }
  creerAvis: async ({ cibleType, cibleNom, note, commentaire }) => {
    const response = await api.post("/api/avis", { cibleType, cibleNom, note, commentaire });
    return response.data;
  },

  // DELETE /api/avis/:id
  supprimerAvis: async (id) => {
    const response = await api.delete(`/api/avis/${id}`);
    return response.data;
  },
};

export default avisService;
