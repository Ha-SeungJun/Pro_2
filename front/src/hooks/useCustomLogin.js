// src/hooks/useCustomLogin.js
// 이 훅은 로그인/로그아웃, 로그인 상태 체크를 공통으로 제공합니다.

import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { loginPostAsync, getUserInfoAsync, logout as logoutAction } from "../slice/loginSlice";

// 백엔드 베이스 URL
const API_BASE =
   process.env.REACT_APP_API_BASE ||

   process.env.REACT_APP_API_BASE ||
   "http://localhost:8080";

// 토큰 유틸
const saveTokens = ({ accessToken, refreshToken }) => {
   // 항상 sessionStorage에만 저장 → 탭/브라우저 닫으면 자동 삭제
   sessionStorage.setItem("accessToken", accessToken);
   sessionStorage.setItem("refreshToken", refreshToken);
};
const clearTokens = () => {
   localStorage.removeItem("accessToken");
   localStorage.removeItem("refreshToken");
   sessionStorage.removeItem("accessToken");
   sessionStorage.removeItem("refreshToken");
};
const hasToken = () =>
   Boolean(sessionStorage.getItem("accessToken"));

// ✅ 실제 로그인 API 호출 (경로 고정: /api/auth/login)
async function loginApi({ loginId, password }) {
   try {
      const { data } = await axios.post(
         `${API_BASE}/api/auth/login`,
         { loginId, password },
         {
            headers: { "Content-Type": "application/json" },
            withCredentials: false,
         }
      );
      return data;
   } catch (err) {
      const msg =
         err?.response?.data?.message ??
         err?.response?.data?.error ??
         err?.message ??
         "로그인 실패";
      throw new Error(msg);
   }
}

const useCustomLogin = () => {
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const loginState = useSelector((state) => state.login);

   const roles = loginState?.roles || [];
   const isAdmin = roles.includes("ROLE_ADMIN");
   const isUser = roles.includes("USER");
   const currentUserId = loginState?.memberId;

   // 로그인 여부: sessionStorage 토큰만 확인
   const isLogin = hasToken() || Boolean(loginState?.email);

   // ✅ 로그인 처리
   const doLogin = async (loginParam) => {
   const loginId =
      loginParam?.loginId ?? loginParam?.id ?? loginParam?.memId ?? "";
   const password =
      loginParam?.password ?? loginParam?.pw ?? loginParam?.password1 ?? "";

   // 1. 토큰 받기
   const result = await dispatch(loginPostAsync({ loginId, password }));
   
   if (loginPostAsync.fulfilled.match(result)) {
      const tokens = result.payload;
      saveTokens({
         accessToken: tokens.accessToken,
         refreshToken: tokens.refreshToken,
      });

      // 2. 유저 정보 + roles 가져오기
      await dispatch(getUserInfoAsync());
   } else {
      throw new Error(result.payload || "로그인 실패");
   }
};

   // ✅ 로그아웃 처리
   const doLogout = async () => {
      clearTokens();
      try {
         await axios.post(
            `${API_BASE}/api/auth/logout`,
            { reason: "user_logout" },
            { withCredentials: true }
         );
      } catch {
         /* 서버 엔드포인트 없어도 무시 */
      }
      try {
         dispatch(logoutAction());
      } catch {
         /* slice에 액션 없으면 무시 */
      }
   };

   const moveToPath = (path) => navigate(path, { replace: true });
   const moveToLogin = () => navigate("/login", { replace: true });
   const moveToLoginReturn = () => <Navigate replace to={"/member/login"} />;

   return {
      loginState,
      isLogin,
      doLogin,
      doLogout,
      moveToLogin,
      moveToPath,
      moveToLoginReturn,
      isAdmin,
      isUser,
      currentUserId,
   };
};

export default useCustomLogin;