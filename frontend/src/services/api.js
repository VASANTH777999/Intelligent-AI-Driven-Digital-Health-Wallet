import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me')
};

export const reportsAPI = {
    upload: (formData) => api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: () => api.get('/reports'),
    getById: (id) => api.get(`/reports/${id}`),
    download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/reports/${id}`),
    search: (params) => api.get('/reports/search/filter', { params }),
    extractVitals: (data) => api.post('/reports/extract-vitals', data)
};

export const vitalsAPI = {
    add: (data) => api.post('/vitals', data),
    getAll: (params) => api.get('/vitals', { params }),
    getTrends: (params) => api.get('/vitals/trends', { params }),
    getTypes: () => api.get('/vitals/types'),
    getSummary: () => api.get('/vitals/summary')
};

export const sharingAPI = {
    grant: (data) => api.post('/sharing/grant', data),
    getGranted: () => api.get('/sharing/granted'),
    getReceived: () => api.get('/sharing/received'),
    revoke: (id) => api.delete(`/sharing/${id}`),
    searchUsers: (email) => api.get('/sharing/users/search', { params: { email } }),
    downloadShared: (reportId) => api.get(`/sharing/report/${reportId}/download`, { responseType: 'blob' })
};

export const aiAPI = {
    analyzeReport: (reportId) => api.post(`/ai/analyze/${reportId}`),
    getAnalysis: (reportId) => api.get(`/ai/analysis/${reportId}`),
    chat: (message, conversationId = null, reportId = null) =>
        api.post('/ai/chat', { message, conversationId, reportId }),
    getConversations: () => api.get('/ai/conversations'),
    getConversation: (id) => api.get(`/ai/conversations/${id}`),
    analyzeVitals: () => api.post('/ai/vitals/analyze')
};

export default api;
