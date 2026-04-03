// src/pages/NaverRedirectPage.jsx
import { useEffect } from "react";

const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

/**
 * 네이버 OAuth 콜백 프런트 엔드포인트
 * - 네이버가 전달한 ?code=...&state=... 쿼리를 그대로
 *   백엔드의 표준 콜백(/login/oauth2/code/naver)으로 포워딩합니다.
 * - 실제 토큰 교환/연결 여부 판단/리다이렉트는 백엔드 SuccessHandler가 수행합니다.
 */
export default function NaverRedirectPage() {
    useEffect(() => {
        const qs = window.location.search || "";
        // 백엔드로 즉시 포워딩 (code/state 그대로 전달)
        window.location.replace(`${API_BASE}/login/oauth2/code/naver${qs}`);
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>네이버 로그인 처리 중...</h2>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
}
