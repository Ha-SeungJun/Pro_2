import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/review`;

export const createReview = async (reviewDTO) => {
  const res = await axios.post(`${prefix}/create`, reviewDTO, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data;
};