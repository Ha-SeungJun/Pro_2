import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/review`;

export const createReview = async (reviewDTO) => {
  const token =
  
    sessionStorage.getItem("accessToken");
    
    console.log(reviewDTO);
    //sessionStorage.getItem("ACCESS_TOKEN");
  const res = await axios.post(`${prefix}/register`, reviewDTO, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });


  /** */
  return res.data;
};
export const getReviewByDeliveryNo = async (deliveryNo) => {
  const token =
sessionStorage.getItem("accessToken");

  const res = await axios.get(`${prefix}/${deliveryNo}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
};
export const getReviewExistsByDeliveryNo = async (deliveryNo) => {
  const token =
sessionStorage.getItem("accessToken");

  const res = await axios.get(`${prefix}/exists/${deliveryNo}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
};