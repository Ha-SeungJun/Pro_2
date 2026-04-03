import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
  "Content-Type": "application/json",
});

// 사용자 공통 정보 (서버에서 userType + data 내려줌)
export const getUserInfo = async () => {
  const res = await axios.get(`${prefix}/user/info`, {
    headers: authHeaders(),
    withCredentials: true,
  });
  return res.data; // { userType, data }
};

// 주소 변경 (userType에 따라 엔드포인트 분기)
export const putUserAddress = async (userType, id, { address, postcode }) => {
  const base = (userType === "CARGO_OWNER" || userType === "DRIVER") ? "cargo" : "member";
  const res = await axios.put(`${prefix}/${base}/${encodeURIComponent(id)}/address`,
    { address, postcode: postcode || null },
    { headers: authHeaders(), withCredentials: true }
  );
  return res.data;
};

// 비밀번호 변경
export const putUserPassword = async (userType, id, { currentPassword, newPassword }) => {
  const base = (userType === "CARGO_OWNER" || userType === "DRIVER") ? "cargo" : "member";
  const res = await axios.put(`${prefix}/${base}/${encodeURIComponent(id)}/password`,
    { currentPassword, newPassword },
    { headers: authHeaders(), withCredentials: true }
  );
  return res.data;
};