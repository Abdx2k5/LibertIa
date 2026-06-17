// =============================================================
// FICHIER  : src/services/payment.service.js
// TÂCHE    : T110 — Historique des paiements (M7)
//
// Récupère l'historique des paiements. En l'absence d'endpoint
// backend dédié, bascule sur le mock paymentsData.js.
// =============================================================

import api from "./api";
import { getPaymentsHistory } from "../mocks/paymentsData";

const paymentService = {
  // GET /api/paiements/historique  (repli mock si indisponible)
  getHistorique: async () => {
    try {
      const response = await api.get("/api/paiements/historique");
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : getPaymentsHistory();
    } catch {
      return getPaymentsHistory();
    }
  },
};

export default paymentService;
