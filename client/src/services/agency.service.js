// =============================================================
// FICHIER  : src/services/agency.service.js
// TÂCHE    : T89/T90/T93 — API agences (M6)
//
// Appelle le backend /api/agences (T99). En cas d'indisponibilité
// de l'API, les lectures basculent silencieusement sur le mock
// agencyData.js pour que l'annuaire reste fonctionnel.
// =============================================================

import api from "./api";
import { getAllAgencies, getAgencyById, getAgenciesForAdmin } from "../mocks/agencyData";

// Normalise la réponse backend ({ success, data }) en tableau/objet simple
const unwrap = (payload) => payload?.data ?? payload;

const agencyService = {
  // GET /api/agences  → liste des agences approuvées
  listerAgences: async (params = {}) => {
    try {
      const response = await api.get("/api/agences", { params });
      return unwrap(response.data) || [];
    } catch {
      return getAllAgencies();
    }
  },

  // GET /api/agences/:id
  getAgence: async (id) => {
    try {
      const response = await api.get(`/api/agences/${id}`);
      return unwrap(response.data);
    } catch {
      return getAgencyById(id);
    }
  },

  // POST /api/agences
  creerAgence: async (payload) => {
    const response = await api.post("/api/agences", payload);
    return unwrap(response.data);
  },

  // Contact agence — pas d'endpoint dédié côté backend : on s'appuie
  // sur le service avis/notifications ultérieurement. Pour l'instant on
  // résout simplement (le formulaire affiche le succès via callback).
  contacterAgence: async (id, payload) => {
    try {
      const response = await api.post(`/api/agences/${id}/contact`, payload);
      return unwrap(response.data);
    } catch {
      // Pas encore d'endpoint : on considère l'envoi comme simulé
      return { success: true, simulated: true };
    }
  },

  // ── Admin (T125 — validation / suspension) ──
  // GET /api/agences/admin  → toutes les agences avec leur statut
  // (en_attente | approuvee | rejetee | suspendue) pour le back-office.
  listerToutes: async () => {
    try {
      const response = await api.get("/api/agences/admin");
      return unwrap(response.data) || [];
    } catch {
      return getAgenciesForAdmin();
    }
  },

  // GET /api/agences/en-attente
  listerEnAttente: async () => {
    try {
      const response = await api.get("/api/agences/en-attente");
      return unwrap(response.data) || [];
    } catch {
      return getAgenciesForAdmin().filter((a) => a.statut === "en_attente");
    }
  },

  // PATCH /api/agences/:id/valider
  validerAgence: async (id) => {
    const response = await api.patch(`/api/agences/${id}/valider`);
    return unwrap(response.data);
  },

  // PATCH /api/agences/:id/rejeter
  rejeterAgence: async (id, motif) => {
    const response = await api.patch(`/api/agences/${id}/rejeter`, { motif });
    return unwrap(response.data);
  },

  // PATCH /api/agences/:id/suspendre  → suspend une agence approuvée
  suspendreAgence: async (id, motif) => {
    const response = await api.patch(`/api/agences/${id}/suspendre`, { motif });
    return unwrap(response.data);
  },

  // PATCH /api/agences/:id/reactiver  → lève la suspension
  reactiverAgence: async (id) => {
    const response = await api.patch(`/api/agences/${id}/reactiver`);
    return unwrap(response.data);
  },
};

export default agencyService;
