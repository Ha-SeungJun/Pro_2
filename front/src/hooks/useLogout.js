// src/hooks/useLogout.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useLogout() {
    const navigate = useNavigate();

    const logout = useCallback(async (redirectTo = '/login') => {
        const API_BASE =
            import.meta?.env?.VITE_API_BASE ||
            process.env.REACT_APP_API_BASE ||
            'http://localhost:8080';

        try {
            // 1) 로컬/세션 저장소 토큰 제거 (프로젝트 키에 맞게 추가/수정)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');

            // axios를 쓰고 있다면 기본 Authorization 헤더도 제거
            if (typeof window !== 'undefined' && window.axios) {
                delete window.axios.defaults.headers.common['Authorization'];
            }

            // 2) 서버에 로그아웃 알림 (쿠키/세션/블랙리스트용) – 있으면 성공/없어도 무시
            //   - HttpOnly 쿠키(리프레시 토큰)는 JS로 못 지우므로 서버 호출 권장
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include', // 쿠키 전송
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'user_logout' }),
                });
            } catch (_) {
                /* 서버 엔드포인트 없거나 실패해도 무시 */
            }
        } finally {
            // 3) 라우팅
            navigate(redirectTo, { replace: true });
        }
    }, [navigate]);

    return logout;
}
