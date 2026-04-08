import axios from 'axios';

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('ACCESS_TOKEN') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getOwnerMonthlyRevenue = async () => {
  const { data } = await api.get('/g2i4/owner/revenue/monthly');
  // data: [{year:2025, month:8, revenue:1234567}, ...]
  return data;
};
