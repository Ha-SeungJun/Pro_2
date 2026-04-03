import axios from "axios";

const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 차주용
export const getOwnerUnpaid = async ({ page, size }) => {
  const res = await api.get("/g2i4/owner/deliveries/unpaid", {
    params: { page, size },
  });
  return res.data;
};

export const getOwnerPaid = async ({ page, size }) => {
  const res = await api.get("/g2i4/owner/deliveries/paid", {
    params: { page, size },
  });
  return res.data;
};

export const getOwnerCompleted = async ({ page, size }) => {
  const res = await api.get("/g2i4/owner/deliveries/completed", {
    params: { page, size },
  });
  return res.data;
};

export const completeDelivery = async (matchingNo) => {
  await api.post(`/g2i4/owner/deliveries/${matchingNo}/complete`);
};

