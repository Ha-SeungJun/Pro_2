import { useEffect } from "react";

const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

/**
 * 구글 OAuth 콜백 (프론트)
 * - 구글이 전달한 ?code=...&state=... 쿼리를
 *   백엔드 표준 콜백(/login/oauth2/code/google)으로 그대로 포워딩.
 * - 실제 토큰 교환/연결 판별/리다이렉트는 백엔드 SuccessHandler가 수행.
 */
export default function GoogleRedirectPage() {
    useEffect(() => {
        const qs = window.location.search || "";
        window.location.replace(`${API_BASE}/login/oauth2/code/google${qs}`);
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>구글 로그인 처리 중...</h2>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
}