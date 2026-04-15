import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginComponent from '../layout/component/users/LoginComponent';
import { tokenStore } from '../lib/tokenStore';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [loading, setLoading] = React.useState(false);
    const [resetSignal, setResetSignal] = React.useState(0); // 실패 시 비번 초기화 트리거

    const prefillId = params.get('loginId') || '';
    const redirectTo = params.get('redirectTo') || '/';

    // ⛔ 로그인 페이지 진입 시 이전/유효하지 않은 토큰이 있으면 가드가 튕겨버릴 수 있음 → 진입 즉시 정리
    React.useEffect(() => {
        tokenStore.clear();
    }, []);

    const handleSubmit = React.useCallback(
        async ({ loginId, password, remember = true }) => {
            setLoading(true);
            try {
                // ✅ 성공 시에만 다음 줄이 실행됨
                await login({ loginId, password, remember });
                navigate(redirectTo, { replace: true });
            } catch (e) {
                // ❗ 실패: alert만 띄우고 페이지에 그대로 머문다
                const msg = e?.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
                alert(msg);
                setResetSignal((n) => n + 1); // 비번 초기화 + 포커스
                return; // 여기서 종료
            } finally {
                setLoading(false);
            }
        },
        [login, navigate, redirectTo]
    );

    const handleFindId = React.useCallback(() => {
        navigate(`/find-id?redirectTo=${encodeURIComponent(redirectTo)}`);
    }, [navigate, redirectTo]);

    const handleFindPassword = React.useCallback((loginIdPrefill = '') => {
        const qs = loginIdPrefill ? `?loginId=${encodeURIComponent(loginIdPrefill)}` : '';
        navigate(`/find-password${qs}`);
    }, [navigate]);

 return (
        <div className="flex flex-col w-full justify-center items-center py-4">
            <div className="w-full max-w-[450px] px-4">
                    <LoginComponent
                        onSubmit={handleSubmit}
                        onFindId={handleFindId}
                        onFindPassword={handleFindPassword}
                        loading={loading}
                        initialLoginId={prefillId}
                        resetSignal={resetSignal}
                    />
                </div>
            </div>
    );
};

export default LoginPage;
