// src/pages/OAuthCallbackPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function parseHash(hash) {
    const h = (hash || "").replace(/^#/, "");
    const out = {};
    h.split("&").forEach((kv) => {
        const [k, v] = kv.split("=");
        if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
    return out;
}

export default function OAuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const { access, refresh, signup_ticket } = parseHash(window.location.hash);

        if (signup_ticket) {
            // 신규 가입 → signup_ticket 보관 후 회원가입 페이지로 이동
            sessionStorage.setItem("signup_ticket", signup_ticket);
            navigate("/signup", { replace: true });
            return;
        }

        if (access && refresh) {
            // 기존 회원 로그인 → 토큰 저장 후 메인으로 이동
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);
            navigate("/", { replace: true });
            return;
        }

        // 토큰도, signup_ticket도 없는 경우 → 로그인 페이지로 에러 리다이렉트
        navigate("/login?error=oauth_callback_no_token", { replace: true });
    }, [navigate]);

    return null; // 로딩 중 잠깐 빈 화면
}
