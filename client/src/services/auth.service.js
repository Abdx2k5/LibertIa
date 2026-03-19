import api from "./api";

const authService = {
  // POST /api/auth/register
  register: async (data) => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  // POST /api/auth/login
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  // GET /api/auth/me
  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

export default authService;