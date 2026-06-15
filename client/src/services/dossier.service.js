import api from "./api";

const dossierService = {
  // GET /api/dossiers/mes-dossiers
  getMesDossiers: async () => {
    const response = await api.get("/api/dossiers/mes-dossiers");
    return response.data;
  },

  // GET /api/dossiers/voyage/:voyageId
  getByVoyage: async (voyageId) => {
    const response = await api.get(`/api/dossiers/voyage/${voyageId}`);
    return response.data;
  },

  // GET /api/dossiers/carte — T85 : souvenirs géolocalisés pour la carte
  getCarteSouvenirs: async () => {
    const response = await api.get("/api/dossiers/carte");
    return response.data;
  },

  // PATCH /api/dossiers/:id
  updateDossier: async (id, payload) => {
    const response = await api.patch(`/api/dossiers/${id}`, payload);
    return response.data;
  },

  // POST /api/dossiers/:id/photos
  ajouterPhoto: async (id, payload) => {
    const response = await api.post(`/api/dossiers/${id}/photos`, payload);
    return response.data;
  },

  // DELETE /api/dossiers/:id/photos/:photoId
  supprimerPhoto: async (id, photoId) => {
    const response = await api.delete(`/api/dossiers/${id}/photos/${photoId}`);
    return response.data;
  },
};

export default dossierService;
