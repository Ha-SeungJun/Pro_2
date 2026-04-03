import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/address`;

/** 단일 주소 단순화 */
export const simplifyOne = async (address) => {
  const res = await axios.post(`${prefix}/simple`, { address });
  return res.data?.result ?? "";
};

/** 배치 주소 단순화: 입력/출력 둘 다 같은 길이의 배열 */
export const simplifyBatch = async (addresses) => {
  const res = await axios.post(`${prefix}/simple-batch`, { addresses });
  return Array.isArray(res.data?.results) ? res.data.results : [];
};

/** route → {from, to} (둘 다 단순화 적용됨) */
export const parseRoute = async (route) => {
  const res = await axios.post(`${prefix}/route`, { route });
  return res.data; // { from, to }
};

/** 임의 값 단축 표현 (route면 포맷, 아니면 주소 단순화) */
export const toShortAddress = async (value) => {
  const res = await axios.post(`${prefix}/short`, { value });
  return res.data?.result ?? "";
};