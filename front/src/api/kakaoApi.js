import axios from "axios";

export const API_SERVER_HOST = `http://localhost:8080`;

export const getKakaoLoginLink = () => {
    return `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;
};

export const getAccessToken = async (authCode) => {
    const access_token_url = `https://kauth.kakao.com/oauth/token`;
    const header = { headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" } };
    const params = {
        grant_type: "authorization_code",
        client_id: rest_api_key,
        redirect_uri: redirect_uri,
        code: authCode
    };
    const res = await axios.post(access_token_url, new URLSearchParams(params), header);
    return res.data.access_token;
};

export const getMemberWithAccessToken = async (accessToken) => {
    const res = await axios.get(`${API_SERVER_HOST}/api/member/kakao?accessToken=${accessToken}`);
    return res.data;
};