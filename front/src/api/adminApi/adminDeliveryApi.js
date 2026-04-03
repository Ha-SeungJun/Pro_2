import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const PREFIX = `${API_SERVER_HOST}/g2i4/admin/delivery`;

export async function searchUserForDeliveryPage(query) {
  const { data } = await axios.get(`${PREFIX}/user-search`, {
    params: { query },
    withCredentials: true,
  });
  return data;
}

export async function fetchAllDeliveries(status = "ALL", keyword = "") { // New function
  const { data } = await axios.get(`${PREFIX}/all`, { // Calls the new backend endpoint
    params: { status, keyword }, // Pass status and keyword as query parameters
    withCredentials: true,
  });
  return data;
}