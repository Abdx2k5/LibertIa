import api from "./api";

const AUTH_BASE = "/api/auth";

// ─────────────────────────────────────────────────────────────
// Toutes les méthodes passent par l'instance `api` partagée
// (baseURL via VITE_API_URL, injection auto du token JWT,
// normalisation des erreurs) et retournent directement le
// corps de la réponse (response.data), pas l'objet axios brut.
// ─────────────────────────────────────────────────────────────
const authService = {
    register: async (data) => {
        const response = await api.post(`${AUTH_BASE}/register`, data);
        return response.data;
    },
    login: async (data) => {
        const response = await api.post(`${AUTH_BASE}/login`, data);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get(`${AUTH_BASE}/me`);
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put(`${AUTH_BASE}/update-profile`, data);
        return response.data.user;
    },
    forgotPassword: async (email) => {
        const response = await api.post(`${AUTH_BASE}/forgot-password`, { email });
        return response.data;
    },
    resetPassword: async (token, motDePasse) => {
        const response = await api.post(`${AUTH_BASE}/reset-password/${token}`, { motDePasse });
        return response.data;
    },
};

export default authService;
