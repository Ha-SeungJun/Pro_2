import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/delivery`;

// 상태: 0(대기) / 1(배송 중) / 2(완료)
//상태 변경
export const updateDeliveryStatus = async (matchingNo, status) => {
  const res = await axios.post(
    `${prefix}/status`,
    { matchingNo, status },
    { withCredentials: true }
  );
  return res.data;
};

//배송 생성
export const createDelivery = async (paymentNo) =>{
  const res = await axios.post(`${prefix}/create`,{paymentNo:paymentNo})

  return res.data
}
//배송 목록 조회
export const getMyDeliveries = async () => {
  const res = await axios.get(`${prefix}/my`, {
    withCredentials: true,
  });
  return res.data;
};