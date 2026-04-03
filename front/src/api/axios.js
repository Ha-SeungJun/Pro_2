// src/api/axios.js
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;  // ✅ 쿠키 자동 전송

export default axios;
