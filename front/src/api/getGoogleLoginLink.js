import axios from "axios";
import { API_SERVER_HOST } from "./getKakaoLoginLink";

const googleClientId = "1056453451424-4ib32lo1sro5f83oj3dlovcrs42a2ple.apps.googleusercontent.com";
const googleClientSecret = "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"; // 보안상 서버 환경변수로 관리 권장
const googleRedirectUri = "http://localhost:3000/member/google-callback";
const googleAuthCodePath = "https://accounts.google.com/o/oauth2/v2/auth";
const googleAccessTokenUri = "https://oauth2.googleapis.com/token";

// 구글 로그인 URL 생성 (state: CSRF 방지용 랜덤 문자열)
export const getGoogleLogin = () => {
    const state = Math.random().toString(36).substring(2);
    const scope = encodeURIComponent("openid email profile");
    const googleURL = `${googleAuthCodePath}?response_type=code&client_id=${googleClientId}&redirect_uri=${encodeURIComponent(googleRedirectUri)}&scope=${scope}&state=${state}`;
    return { url: googleURL, state };
};

// 구글 인가코드로 액세스 토큰 요청
export const getGoogleAccessToken = async (authCode) => {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code: authCode,
        redirect_uri: googleRedirectUri
    });

    try {
        const res = await axios.post(googleAccessTokenUri, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        return res.data.access_token;
    } catch (err) {
        console.error("❌ Google access_token 발급 실패:", err.response?.data || err.message);
        throw err;
    }
};

// 액세스 토큰으로 구글 회원 정보 가져오기
export const getMemberWithGoogleAccessToken = async (accessToken) => {
    try {
        const res = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        // 여기서 res.data를 서버에 전달해 회원가입/로그인 처리
        const serverRes = await axios.post(`${API_SERVER_HOST}/api/member/google`, res.data);
        return serverRes.data;
    } catch (err) {
        console.error("❌ 구글 사용자 정보 가져오기 실패:", err.response?.data || err.message);
        throw err;
    }
};
