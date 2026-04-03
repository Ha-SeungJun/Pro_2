import axios from 'axios';

const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('ACCESS_TOKEN') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMyInquiries = async (limit = 10) => {
  const { data } = await api.get('/g2i4/qna/my', { params: { limit } });
  // [{ postId, title, createdAt, answered }]
  return Array.isArray(data) ? data : [];
};
