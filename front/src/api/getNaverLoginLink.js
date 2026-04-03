import axios from "axios";
import { API_SERVER_HOST } from "./getKakaoLoginLink";

const naverClientId = "neoUA3EdRmckzWTiDCOh";
const naverClientSecret = "Hw3TPPunH0"; // 보안을 위해 포함
const naverRedirectUri = "http://localhost:3000/member/naver-callback";
const naverAuthCodePath = "https://nid.naver.com/oauth2.0/authorize";
const naverAccessTokenUri = "https://nid.naver.com/oauth2.0/token";

// 네이버 로그인 URL 생성 (state: CSRF 방지용 랜덤 문자열)
export const getNaverLogin = () => {
    const state = Math.random().toString(36).substring(2);
    const naverURL = `${naverAuthCodePath}?response_type=code&client_id=${naverClientId}&redirect_uri=${encodeURIComponent(naverRedirectUri)}&state=${state}`;
    return { url: naverURL, state };
};

// 네이버 인가코드로 액세스 토큰 요청
export const getNaverAccessToken = async (authCode, state) => {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: naverClientId,
        client_secret: naverClientSecret,
        code: authCode,
        state: state
    });

    try {
        const res = await axios.get(`${naverAccessTokenUri}?${params.toString()}`);
        return res.data.access_token;
    } catch (err) {
        console.error("❌ Naver access_token 발급 실패:", err.response?.data || err.message);
        throw err;
    }
};

// 액세스 토큰으로 네이버 회원 정보 가져오기 (서버 API 호출)
export const getMemberWithNaverAccessToken = async (accessToken) => {
    const res = await axios.get(`${API_SERVER_HOST}/api/member/naver?accessToken=${accessToken}`);
    return res.data;
};
