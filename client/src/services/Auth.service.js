import axios from 'axios';

const API = 'http://localhost:5000/api/auth';

const authService = {
    register: (data) => axios.post(`${API}/register`, data),
    login:    (data) => axios.post(`${API}/login`, data),
    getMe:    (token) => axios.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    updateProfile: (data, token) => axios.put(`${API}/update-profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    forgotPassword: (email) => axios.post(`${API}/forgot-password`, { email }),
    resetPassword:  (token, motDePasse) => axios.post(`${API}/reset-password/${token}`, { motDePasse }),
};

export default authService;
