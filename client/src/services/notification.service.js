// =============================================================
// FICHIER  : src/services/notification.service.js
// TÂCHE    : T71 — Notifications temps réel
// =============================================================

import api from "./api";

const notificationService = {
  // GET /api/notifications?page=&limit=
  getNotifications: async (params = {}) => {
    const response = await api.get("/api/notifications", { params });
    return response.data;
  },

  // GET /api/notifications/non-lues/count
  getUnreadCount: async () => {
    const response = await api.get("/api/notifications/non-lues/count");
    return response.data;
  },

  // PATCH /api/notifications/:id/lire
  marquerLue: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/lire`);
    return response.data;
  },

  // PATCH /api/notifications/tout-lire
  marquerToutLu: async () => {
    const response = await api.patch("/api/notifications/tout-lire");
    return response.data;
  },

  // DELETE /api/notifications/:id
  supprimerNotification: async (id) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
