import api from "./api";

const voyageService = {
  // POST /api/voyages/generer
  generer: async (prompt) => {
    const response = await api.post("/api/voyages/generer", { prompt });
    return response.data;
  },

  // GET /api/voyages/mes-voyages
  getMesVoyages: async () => {
    const response = await api.get("/api/voyages/mes-voyages");
    return response.data;
  },

  // GET /api/voyages/:id
  getById: async (id) => {
    const response = await api.get(`/api/voyages/${id}`);
    return response.data;
  },
};

export default voyageService;