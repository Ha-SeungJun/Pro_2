import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../lib/tokenStore';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../slice/loginSlice';

const API_BASE =
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    'http://localhost:8080';

export default function useAuth() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /**
     * 로그인
     * - 성공: data 반환
     * - 실패: Error throw → 상위(LoginPage)에서 alert 처리
     */
    const login = useCallback(
        async ({ loginId, password, remember = true }) => {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ loginId, password }),
            });

            if (!res.ok) {
                // 실패 → 토큰 정리 후 에러 throw
                tokenStore.clear();

                let msg = '';
                try {
                    const ct = res.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const j = await res.json();
                        msg = j.message || j.error || '';
                    } else {
                        msg = await res.text();
                    }
                } catch {
                    // ignore
                }

                if (res.status === 401) {
                    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                }
                if (res.status === 429) {
                    throw new Error('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.');
                }
                throw new Error(msg || `로그인 실패 (code: ${res.status})`);
            }

            // 성공 처리
            const data = await res.json(); // { accessToken, refreshToken, ... }
            tokenStore.save(
                { accessToken: data.accessToken, refreshToken: data.refreshToken },
                remember
            );

            // Redux 로그인 상태 반영
            try {
                const base64Url = data.accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(
                    decodeURIComponent(
                        atob(base64)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    )
                );

                dispatch(
                    loginAction({
                        email: payload.email || payload.memEmail || '',
                        nickname: payload.name || '',
                        pw: '',
                        roles: payload.roles || payload.rolenames || ['USER'],
                        memberId: payload.memId || payload.cargoId || payload.sub || null,
                    })
                );
            } catch {
                // payload 파싱 실패는 무시
            }

            return data;
        },
        [dispatch]
    );

    /**
     * 로그아웃
     * - 백엔드 로그아웃 호출 후 토큰 삭제
     * - 기본적으로 /login 페이지로 이동
     */
    const logout = useCallback(
        async (to = '/login') => {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                });
            } catch {
                // ignore
            }
            tokenStore.clear();
            navigate(to, { replace: true });
        },
        [navigate]
    );

    return { login, logout };
}
