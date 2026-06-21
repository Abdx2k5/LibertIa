import api from "./api";

const messagePriveService = {
  // GET /api/messages/conversations
  getConversations: async () => {
    const response = await api.get("/api/messages/conversations");
    return response.data?.data || [];
  },

  // GET /api/messages/:userId
  getThread: async (userId) => {
    const response = await api.get(`/api/messages/${userId}`);
    return response.data;
  },
};

export default messagePriveService;
