import axios from "axios";
import { API_SERVER_HOST } from "./serverConfig";

const PREFIX = `${API_SERVER_HOST}/api/qaboard/posts`;

// 수정: 여러 저장 위치/키를 모두 확인
const getAccessToken = () =>
  sessionStorage.getItem("accessToken") ||
  sessionStorage.getItem("ACCESS_TOKEN") ||
  "";

const authHeader = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
  "Content-Type": "application/json",
});

// 답변 생성
export const createResponse = async (postId, data) => {
  const res = await axios.post(
    `${PREFIX}/${postId}/response`,
    data,
    { headers: authHeader() }
  );
  return res.data;
};

// 답변 수정
export const updateResponse = async (postId, data) => {
  const res = await axios.put(
    `${PREFIX}/${postId}/response`,
    data,
    { headers: authHeader() }
  );
  return res.data;
};

// 답변 조회
export const getResponse = async (postId) => {
  const res = await axios.get(
    `${PREFIX}/${postId}/response`,
    { headers: authHeader() }
  );
  return res.data;
};

// 답변 삭제
export const deleteResponse = async (postId) => {
  const res = await axios.delete(
    `${PREFIX}/${postId}/response`,
    { headers: authHeader() }
  );
  return res.data;
};