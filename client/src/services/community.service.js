import api from "./api";

const communityService = {
  // GET /api/community/recherche?q=...&type=users
  rechercheUsers: async (q) => {
    const response = await api.get("/api/community/recherche", { params: { q, type: "users" } });
    return response.data?.data?.users || [];
  },

  // GET /api/community/users/:id/following
  getFollowing: async (userId) => {
    const response = await api.get(`/api/community/users/${userId}/following`);
    return response.data?.data || [];
  },

  // POST /api/community/users/:id/follow
  followUser: async (id) => {
    const response = await api.post(`/api/community/users/${id}/follow`);
    return response.data;
  },

  // DELETE /api/community/users/:id/unfollow
  unfollowUser: async (id) => {
    const response = await api.delete(`/api/community/users/${id}/unfollow`);
    return response.data;
  },
};

export default communityService;
