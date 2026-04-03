// src/hooks/useCustomLogin.js
// 이 훅은 로그인/로그아웃, 로그인 상태 체크를 공통으로 제공합니다.

import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { logout as logoutAction } from "../slice/loginSlice";

// 백엔드 베이스 URL
const API_BASE =
   import.meta?.env?.VITE_API_BASE ||
   process.env.REACT_APP_API_BASE ||
   "http://localhost:8080";

// 토큰 유틸
const saveTokens = ({ accessToken, refreshToken }, remember = true) => {
   const store = remember ? localStorage : sessionStorage;
   store.setItem("accessToken", accessToken);
   store.setItem("refreshToken", refreshToken);
};
const clearTokens = () => {
   localStorage.removeItem("accessToken");
   localStorage.removeItem("refreshToken");
   sessionStorage.removeItem("accessToken");
   sessionStorage.removeItem("refreshToken");
};
const hasToken = () =>
   Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));

// ✅ 실제 로그인 API 호출 (경로 고정: /api/auth/login)
async function loginApi({ loginId, password }) {
   try {
      const { data } = await axios.post(
         `${API_BASE}/api/auth/login`,
         { loginId, password },
         {
            headers: { "Content-Type": "application/json" },
            withCredentials: false, // 세션/쿠키 기반이면 true
         }
      );
      // { tokenType, accessToken, refreshToken, expiresIn }
      return data;
   } catch (err) {
      // response가 없을 수도 있으니 안전하게 파싱
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

   // 리덕스 상태 (이메일/역할 등 기존 로직 유지)
   const loginState = useSelector((state) => state.login);

   // 권한/식별자 (기존 필드 유지)
   const roles = loginState?.roles || [];
   const isAdmin = roles.includes("ROLE_ADMIN");
   const isUser = roles.includes("USER");
   const currentUserId = loginState?.memberId;

   // 로그인 여부: 토큰 존재 OR 기존 email 필드
   const isLogin = hasToken() || Boolean(loginState?.email);

   // ✅ 로그인 처리
   // loginParam 키가 달라도 유연하게 매핑 (loginId/password가 정식)
   const doLogin = async (loginParam) => {
      const loginId =
         loginParam?.loginId ??
         loginParam?.id ??
         loginParam?.memId ??
         "";
      const password =
         loginParam?.password ??
         loginParam?.pw ??
         loginParam?.password1 ??
         "";
      const remember = loginParam?.remember ?? true;

      // 백엔드 호출
      const tokens = await loginApi({ loginId, password });

      // 토큰 저장 (스토리지 선택)
      saveTokens(
         { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
         remember
      );

      // 필요 시: 리덕스 상태 초기화/동기화(선택)
      // dispatch(loginSuccess({ ... }))

      return tokens;
   };

   // ✅ 로그아웃 처리 (토큰 삭제 + 서버 알림(있으면))
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

   // 네비게이션 유틸
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
