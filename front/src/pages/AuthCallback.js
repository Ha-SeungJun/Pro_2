import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function parseHash(hash) {
    const h = (hash || "").replace(/^#/, "");
    const out = {};
    h.split("&").forEach(kv => {
        const [k, v] = kv.split("=");
        if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
    return out;
}

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const { access, refresh } = parseHash(window.location.hash);
        if (access) localStorage.setItem("accessToken", access);
        if (refresh) localStorage.setItem("refreshToken", refresh);
        // 해시 지우기(토큰 흔적 제거)
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/", { replace: true });
    }, [navigate]);

    return null;
}