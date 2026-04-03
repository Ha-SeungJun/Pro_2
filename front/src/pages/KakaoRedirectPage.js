import { useEffect } from "react";

const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

/**
 * 카카오 OAuth 콜백 (프론트)
 * - 카카오가 전달한 ?code=...&state=... 쿼리를
 *   백엔드 표준 콜백(/login/oauth2/code/kakao)으로 그대로 포워딩합니다.
 * - 실제 토큰 교환/연결 판별/리다이렉트는 백엔드 SuccessHandler가 수행합니다.
 */
export default function KakaoRedirectPage() {
    useEffect(() => {
        const qs = window.location.search || "";
        window.location.replace(`${API_BASE}/login/oauth2/code/kakao${qs}`);
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>카카오 로그인 처리 중...</h2>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
}