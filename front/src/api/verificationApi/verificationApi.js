import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/verification`;

export const getMyVerificationStatus = async () => {
  const token = sessionStorage.getItem("accessToken");

  const res = await axios.get(`${prefix}/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
};


// 본인인증 시작용
export const startVerification = async () => {
  const token = sessionStorage.getItem("accessToken");

  const res = await axios.post(
    `${prefix}/start`,
    {},
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return res.data;
};

export const confirmVerification = async ({ identityVerificationId }) => {
  const token = sessionStorage.getItem("accessToken");

  const res = await axios.post(
    `${prefix}/confirm`,
    { identityVerificationId },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return res.data;
};