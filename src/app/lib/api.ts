import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8085/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor for API calls
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

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error is due to 401 Unauthorized (expired token)
        if (error.response && error.response.status === 401) {
            console.log('Session expired. Redirecting to login...');
            
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            
            // Show notification
            toast.error('Your session has expired. Please log in again.');
            
            // Redirect to login page
            window.location.href = '/auth/login';
            return Promise.reject(error);
        }
        
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const auth = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (name: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    },
};

export const user = {
    setupPin: async (pin: string) => {
        const response = await api.post('/auth/setup-pin', { pin });
        return response.data;
    },
    verifyPin: async (pin: string) => {
        const response = await api.post('/auth/verify-pin', { pin });
        return response.data;
    },
    searchByEmail: async (email: string) => {
        const response = await api.get(`/user/search?email=${encodeURIComponent(email)}`);
        return response.data;
    },
    checkPinStatus: async () => {
        const response = await api.get('/user/check-pin-status');
        return response.data;
    },
};

export const admin = {
    getPendingUsers: () => api.get('/admin/pending-users'),
    approveUser: async (userId: number) => {
        const response = await api.put(`/admin/approve/${userId}`);
        return response.data;
    },
    getAllTransactions: async () => {
        const response = await api.get('/admin/transactions');
        return response.data;
    },
};

export const wallet = {
    getWalletInfo: async () => {
        const response = await api.get('/user/wallet-info');
        return response.data;
    },
    transfer: async (receiverId: number, amount: number, pin: string) => {
        const response = await api.post('/user/transfer', {
            receiverUserId: receiverId,
            amount,
            pin,
        });
        return response.data;
    },
    transferByEmail: async (receiverEmail: string, amount: number, pin: string) => {
        const response = await api.post('/user/transfer-by-email', {
            receiverEmail,
            amount,
            pin,
        });
        return response.data;
    },
};

export default api;