import axios from "axios";

export const API_SERVER_HOST = "http://https://pro-2-ayf7.onrender.com";
const prefix = `${API_SERVER_HOST}/g2i4/coupons`;

export const getMyCouponList = async () => {

  const token = sessionStorage.getItem("accessToken") || sessionStorage.getItem("ACCESS_TOKEN");

  if (!token) {
    console.error("🚨 세션에 토큰이 없습니다! (로그아웃됨)");
    return []; 
  }

  const res = await axios.get(`${prefix}/my-list`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return res.data;
};