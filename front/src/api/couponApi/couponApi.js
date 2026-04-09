import axios from "axios";

// 백엔드 서버 주소 (환경에 맞게 수정)
export const API_SERVER_HOST = "http://localhost:8080";

const prefix = `${API_SERVER_HOST}/g2i4/coupons`;

// 사용자의 쿠폰 목록 가져오기
export const getMyCouponList = async (userId) => {
  // GET http://localhost:8080/g2i4/coupons/my-list/test1
  const res = await axios.get(`${prefix}/my-list/${userId}`);
  return res.data;
};