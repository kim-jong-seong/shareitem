import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Request 인터셉터: 자동으로 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
