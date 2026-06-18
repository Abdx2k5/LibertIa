// =============================================================
// FICHIER  : src/services/moderation.service.js
// TÂCHE    : T123 — Modération contenus signalements (M9)
//
// Appelle le backend /api/signalements. En cas d'indisponibilité,
// les lectures basculent silencieusement sur le mock
// signalementData.js pour que le back-office reste utilisable.
// =============================================================

import api from "./api";
import { getSignalements } from "../mocks/signalementData";

const unwrap = (payload) => payload?.data ?? payload;

const moderationService = {
  // GET /api/signalements  → file de modération
  listerSignalements: async (params = {}) => {
    try {
      const response = await api.get("/api/signalements", { params });
      return unwrap(response.data) || [];
    } catch {
      return getSignalements();
    }
  },

  // PATCH /api/signalements/:id/conserver → contenu jugé conforme
  conserverContenu: async (id) => {
    const response = await api.patch(`/api/signalements/${id}/conserver`);
    return unwrap(response.data);
  },

  // DELETE /api/signalements/:id/contenu → supprime le contenu signalé
  supprimerContenu: async (id) => {
    const response = await api.delete(`/api/signalements/${id}/contenu`);
    return unwrap(response.data);
  },

  // PATCH /api/signalements/:id/rejeter → signalement abusif / non fondé
  rejeterSignalement: async (id) => {
    const response = await api.patch(`/api/signalements/${id}/rejeter`);
    return unwrap(response.data);
  },

  // POST /api/utilisateurs/:id/bannir → bannit l'auteur du contenu
  bannirAuteur: async (auteurId, motif) => {
    const response = await api.post(`/api/utilisateurs/${auteurId}/bannir`, { motif });
    return unwrap(response.data);
  },
};

export default moderationService;
