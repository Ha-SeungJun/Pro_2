// src/api/axios.js
import axios from "axios";

axios.defaults.baseURL = "http://https://pro-2-ayf7.onrender.com";
axios.defaults.withCredentials = true;  // ✅ 쿠키 자동 전송

export default axios;
