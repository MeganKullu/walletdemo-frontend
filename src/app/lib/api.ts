import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
};

export const admin = {
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
  transfer: async (receiverId: number, amount: number, pin: string) => {
    const response = await api.post('/user/transfer', {
      receiverUserId: receiverId,
      amount,
      pin,
    });
    return response.data;
  },
};

export default api;