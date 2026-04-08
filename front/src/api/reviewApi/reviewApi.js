import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/review`;

export const createReview = async (reviewDTO) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("ACCESS_TOKEN") ||
    sessionStorage.getItem("ACCESS_TOKEN");

     console.log("api로 전달된 reviewDTO:", reviewDTO);

  const res = await axios.post(`${prefix}/register`, reviewDTO, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
};
export const getReviewByDeliveryNo = async (deliveryNo) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("ACCESS_TOKEN") ||
    sessionStorage.getItem("ACCESS_TOKEN");

  const res = await axios.get(`${prefix}/${deliveryNo}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
};
export const getReviewExistsByDeliveryNo = async (deliveryNo) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("ACCESS_TOKEN") ||
    sessionStorage.getItem("ACCESS_TOKEN");

  const res = await axios.get(`${prefix}/exists/${deliveryNo}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
};